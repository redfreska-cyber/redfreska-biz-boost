-- Create function and trigger to auto-create restaurante and admin role on user signup
create or replace function public.handle_new_user_restaurante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurante_id uuid;
begin
  -- If the user already has a role, skip to prevent duplicates
  if exists (select 1 from public.user_roles where user_id = new.id) then
    return new;
  end if;

  -- Create restaurante using metadata when available
  insert into public.restaurantes (nombre, ruc, correo, telefono, direccion)
  values (
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'ruc',''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'telefono',''),
    nullif(new.raw_user_meta_data ->> 'direccion','')
  )
  returning id into v_restaurante_id;

  -- Link user to restaurante as admin
  insert into public.user_roles (user_id, restaurante_id, role)
  values (new.id, v_restaurante_id, 'admin');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_restaurante on auth.users;
create trigger on_auth_user_created_restaurante
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user_restaurante();