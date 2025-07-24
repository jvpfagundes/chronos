from app.core.sql_async import SQLQueryAsync
from app.services.decorator import Response
from app.services.exception import ValidationError
from app.utils.date import str_to_datetime, str_to_date

class Entries(SQLQueryAsync):
    def __init__(self, user_id):
        super().__init__()
        self.user_id = user_id

    @Response(desc_error="Error when fetching entries.", return_list=['entries_list', "total_count"])
    async def get_entries(self, dat_start, dat_end, limit, offset, require_total_count):
        pagination = f""
        filter = f""
        if limit:
            pagination += f"limit {limit if limit <= 10 else 10} offset {offset if offset else 0}"
        else:
            pagination += f"limit 5"

        if dat_start and dat_end:
            filter += f"and e.date between :dat_start and :dat_end"
            dat_start, dat_end = str_to_date(dat_start=dat_start, dat_end=dat_end)

        query = f"""
        select e.id,
               e.title,
               e.description,
               e.duration,
               e.datm_start::varchar,
               e.datm_end::varchar,
               e.datm_interval_start::varchar,
               e.datm_interval_end::varchar,
               p.name as project_name,
               e.date::varchar as entrie_date
        from public.entries e 
            join public.projects p
                on p.id = e.project_id
        where e.status = true 
              and e.user_id = :user_id
              {filter}
        order by e.date desc
        {pagination} 
        """

        ls_entries = await self.select(query, parameters=dict(dat_start=dat_start, dat_end=dat_end, user_id=self.user_id))

        if require_total_count:
            total_count = await self.select(query="""select count(id) 
                                                     from public.entries 
                                                     where status = true 
                                                     and user_id = :user_id""", parameters=dict(user_id=self.user_id),
                                            is_first=True, is_values_list=True)
        else:
            total_count = None

        return ls_entries, total_count


    @Response(desc_error="Error when creating entry.", return_list=["entry_data"])
    async def create_entry(self,title, description, datm_start, datm_end, datm_interval_start, datm_interval_end,
                           project_id, entry_date):
        if not datm_start or not datm_end:
            raise ValidationError("Entries should have start and end!")

        if datm_interval_start:
            datm_interval_start, datm_interval_end = str_to_datetime(datm_interval_start=datm_interval_start,
                                                                     datm_interval_end=datm_interval_end)
            interval_duration = (datm_interval_end - datm_interval_start).seconds
        else:
            interval_duration = 0

        datm_start, datm_end = str_to_datetime(datm_start=datm_start, datm_end=datm_end)
        duration = (datm_end - datm_start).seconds - interval_duration

        dict_entry = {
            "title": title,
            "description": description,
            "duration": duration,
            "datm_start": datm_start,
            "datm_end": datm_end,
            "datm_interval_start": datm_interval_start,
            "datm_interval_end": datm_interval_end,
            "project_id": project_id,
            "date": str_to_date(entry_date=entry_date),
            "user_id": self.user_id
        }

        entry_id = await self.insert("entries", dict_entry)

        return entry_id

    @Response(desc_error="Error when deleting entry.", return_list=[])
    async def soft_delete_entry(self, entry_id):
        if await self.validate_entry_user(entry_id):
            await self.disable("entries", dict_filter={"id": entry_id})
        else:
            raise ValidationError("You do not have permission to delete this entry.", status_code=401)

    async def validate_entry_user(self, entry_id):
        return await self.select(query=f"""
        select true from entries where id = :entry_id and user_id = :user_id
        """, parameters=dict(user_id=self.user_id, entry_id=entry_id), is_first=True, is_values_list=True) or False




    @Response(desc_error="Error when fetching cards.", return_list=["cards_dict"])
    async def get_entries_cards(self, dat_start, dat_end):
        dat_start, dat_end = str_to_date(dat_start=dat_start, dat_end=dat_end)

        query = f"""
        select sum(e.duration) as total_logged
        from public.entries e 
        where e.status = true 
              and e.user_id = :user_id
              and e.date between :dat_start and :dat_end
        """

        entries_cards_dict = await self.select(query, parameters=dict(dat_start=dat_start, dat_end=dat_end,
                                                                      user_id=self.user_id), is_first=True)

        return entries_cards_dict


    @Response(desc_error="Error when fetching streak.", return_list=['entries_streak'])
    async def get_entries_streak(self):
        query = f"""
        WITH numbered AS (
          SELECT
            date,
            ROW_NUMBER() OVER (ORDER BY date) AS rn
          FROM entries
          WHERE date <= CURRENT_DATE
                and user_id = :user_id
                and status = TRUE
        ),
        grouped AS (
          SELECT
            date,
            rn,
            date - (rn || ' days')::interval AS grp
          FROM numbered
        ),
        streaks AS (
          SELECT
            MIN(date) AS streak_start,
            MAX(date) AS streak_end,
            COUNT(*) AS streak_length
          FROM grouped
          GROUP BY grp
        )
        SELECT
          streak_length
        FROM streaks
        WHERE streak_end = CURRENT_DATE;
        """

        streak = await self.select(query, parameters=dict(user_id=self.user_id),
                                   is_first=True, is_values_list=True) or 0

        return streak

    @Response(desc_error="Error when fetching days.", return_list=['entries_days'])
    async def get_days_entries(self, dat_start, dat_end):
        query = """
        WITH RECURSIVE calendar AS (
              SELECT (:dat_start)::DATE AS day
              UNION ALL
              SELECT (day + INTERVAL '1 day')::DATE
              FROM calendar
              WHERE day + INTERVAL '1 day' <= DATE (:dat_end)::DATE
            )
            SELECT
              calendar.day::varchar,
              sum(e.duration) as daily_duration,
              CASE WHEN e.date IS NOT NULL THEN true ELSE false END as have_entries
            FROM
              calendar
            LEFT JOIN entries e
                ON e.date = calendar.day
                  and e.user_id = :user_id
                  and e.date between :dat_start and :dat_end
                  and e.status = TRUE
            GROUP BY
                calendar.day, e.date
            ORDER BY
              calendar.day;
        """
        dat_start, dat_end = str_to_date(dat_start=dat_start, dat_end=dat_end)

        ls_entries = await self.select(query, parameters=dict(dat_start=dat_start, dat_end=dat_end, user_id=self.user_id))

        return ls_entries

    @Response(desc_error="Error when creating project", return_list=["project_id"])
    async def create_project(self, project_name):
        project_dict = {
            "name": project_name,
            "user_id":self.user_id
        }

        project_id = await self.insert("projects", project_dict)

        return project_id

    @Response(desc_error="Error when fetching projects", return_list=["projects_list"])
    async def get_projects(self):
        return await self.select(f"""
        select p.name,
               p.id
        from public.projects p
        where p.user_id = :user_id
        """, parameters=dict(user_id=self.user_id))