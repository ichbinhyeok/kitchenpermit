import { redirect } from "next/navigation";

type FreeAxis1ReportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FreeAxis1ReportPage({
  searchParams,
}: FreeAxis1ReportPageProps) {
  const params = new URLSearchParams();

  Object.entries(await searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  redirect(query ? `/p/free?${query}` : "/p/free");
}
