import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/get-current-org";
import { PeopleClient } from "./people-client";

type EmployeeManager = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export default async function PeoplePage() {
  const supabase = await createClient();
  const ctx = await getCurrentOrg();
  if (!ctx) redirect("/sign-in");

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch employees", error);
  }

  const managerIds = Array.from(
    new Set(
      (employees ?? [])
        .map((employee) => employee.manager_id)
        .filter((id): id is string => id !== null)
    )
  );

  let managers: EmployeeManager[] = [];

  if (managerIds.length > 0) {
    const { data: managerData, error: managerError } = await supabase
      .from("employees")
      .select("id, full_name, avatar_url:photo_url")
      .in("id", managerIds);

    if (managerError) {
      console.error("Failed to fetch manager data:", managerError);
    } else {
      managers = (managerData ?? []) as EmployeeManager[];
    }
  }

  const managerMap = new Map(managers.map((manager) => [manager.id, manager]));
  const employeesWithManager = (employees ?? []).map((employee) => ({
    ...employee,
    manager: employee.manager_id ? managerMap.get(employee.manager_id) ?? null : null,
  }));

  return (
    <PeopleClient
      employees={employeesWithManager}
      isAdmin={ctx.isAdmin}
      orgId={ctx.org.id}
    />
  );
}
