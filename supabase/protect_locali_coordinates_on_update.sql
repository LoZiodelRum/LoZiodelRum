-- Prevent accidental coordinate loss on updates.
-- If an update sends NULL for latitudine/longitudine, preserve existing values.

create or replace function public.protect_locali_coordinates_on_update()
returns trigger
language plpgsql
as $$
begin
  if new.latitudine is null then
    new.latitudine := old.latitudine;
  end if;

  if new.longitudine is null then
    new.longitudine := old.longitudine;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_locali_coordinates_on_update on public."Locali";

create trigger trg_protect_locali_coordinates_on_update
before update on public."Locali"
for each row
execute function public.protect_locali_coordinates_on_update();
