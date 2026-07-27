-- ============================================================
-- 009_fix_search_artists.sql
-- search_artists RPC 버그 수정
--
-- 수정 1 (guest_matches):
--   과거 종료 일정으로 guest_matches에 포함되는 문제 차단
--   gs.end_date >= current_date 조건 추가
--
-- 수정 2 (next_sched):
--   p_type = 'guest'일 때만 선택 도시 일정만 반환
--   based/all 조회에서는 아티스트의 전체 도시 중 다음 일정 기존 유지
--   조건: p_type is distinct from 'guest' or p_city is null or lower(gs.city) = lower(p_city)
-- ============================================================

create or replace function public.search_artists(
  p_tag_slugs  text[]   default '{}',
  p_city       text     default null,
  p_start_date date     default null,
  p_end_date   date     default null,
  p_type       text     default 'all'
)
returns table (
  artist_id        uuid,
  display_name     text,
  instagram_handle text,
  is_verified      boolean,
  is_claimed       boolean,
  base_city        text,
  base_country     text,
  contact_type     text,
  contact_value    text,
  matched_tags     bigint,
  total_tags       bigint,
  priority         int,
  next_schedule    jsonb,
  tags             jsonb
)
language sql
stable
as $$
  with
  -- 검색 태그 UUID 변환
  search_tag_ids as (
    select id from public.tags where slug = any(p_tag_slugs)
  ),
  -- 아티스트별 태그 집계
  tag_counts as (
    select
      at2.artist_id,
      count(*)                                             as total,
      count(*) filter (
        where at2.tag_id in (select id from search_tag_ids)
      )                                                    as matched
    from public.artist_tags at2
    group by at2.artist_id
  ),
  -- 게스트 아티스트 (도시 + 날짜 조건)
  -- [수정 1] gs.end_date >= current_date 추가:
  --   과거 종료 일정으로 guest_matches에 포함되는 문제 차단
  guest_matches as (
    select distinct gs.artist_id
    from public.guest_schedules gs
    where gs.is_active = true
      and gs.end_date >= current_date
      and (p_city       is null or lower(gs.city) = lower(p_city))
      and (p_start_date is null or gs.end_date    >= p_start_date)
      and (p_end_date   is null or gs.start_date  <= p_end_date)
  ),
  -- 아티스트별 가장 가까운 다음 일정
  -- [수정 2] p_type = 'guest'일 때만 선택 도시 일정만 반환
  --   based/all은 아티스트의 전체 도시 중 가장 빠른 다음 일정 기존 유지
  next_sched as (
    select distinct on (gs.artist_id)
      gs.artist_id,
      jsonb_build_object(
        'id',           gs.id,
        'city',         gs.city,
        'country',      gs.country,
        'start_date',   gs.start_date::text,
        'end_date',     gs.end_date::text,
        'contact_type', gs.contact_type,
        'contact_value',gs.contact_value,
        'note',         gs.note
      ) as sched
    from public.guest_schedules gs
    where gs.is_active = true
      and gs.end_date >= current_date
      and (
        p_type is distinct from 'guest'
        or p_city is null
        or lower(gs.city) = lower(p_city)
      )
    order by gs.artist_id, gs.start_date asc
  ),
  -- 아티스트별 태그 배열
  artist_tag_list as (
    select
      at2.artist_id,
      jsonb_agg(
        jsonb_build_object(
          'id',    t.id,
          'name',  t.name,
          'slug',  t.slug,
          'group', t.group_type
        ) order by t.group_type, t.name
      ) as tags
    from public.artist_tags at2
    join public.tags t on t.id = at2.tag_id
    group by at2.artist_id
  )
  select
    ap.id,
    ap.display_name,
    ap.instagram_handle,
    ap.is_verified,
    ap.is_claimed,
    ap.base_city,
    ap.base_country,
    ap.contact_type,
    ap.contact_value,
    coalesce(tc.matched, 0)                                          as matched_tags,
    coalesce(tc.total, 0)                                            as total_tags,
    case
      when array_length(p_tag_slugs, 1) > 0
        and coalesce(tc.matched, 0) = coalesce(tc.total, 0)
        and coalesce(tc.total, 0) > 0 then 1
      else 2
    end                                                              as priority,
    ns.sched                                                         as next_schedule,
    coalesce(atl.tags, '[]'::jsonb)                                  as tags
  from public.artist_profiles ap
  left join tag_counts       tc  on tc.artist_id  = ap.id
  left join guest_matches    gm  on gm.artist_id  = ap.id
  left join next_sched       ns  on ns.artist_id  = ap.id
  left join artist_tag_list  atl on atl.artist_id = ap.id
  where
    -- 타입 필터 (기존 동일)
    (
      p_type = 'all'
      or (p_type = 'guest' and gm.artist_id is not null)
      or (p_type = 'based'
          and (p_city is null or lower(ap.base_city) = lower(p_city)))
    )
    -- 태그 필터: 1개 이상 일치하거나 태그 검색 없음 (기존 동일)
    and (
      array_length(p_tag_slugs, 1) is null
      or array_length(p_tag_slugs, 1) = 0
      or coalesce(tc.matched, 0) > 0
    )
  order by
    priority asc,
    coalesce(tc.total, 0) asc,
    ap.display_name asc;
$$;
