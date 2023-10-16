import { getBusinessesQuery } from "@/services/business";
import { getTags } from "@/services/tag";
import { Notification } from "@/ui/notification";
import Elysia, { t } from "elysia";
import MarketingTemplate from "./template";
import { SelectBusiness } from "@/db/schema/business";
import { SelectBusinessHours } from "@/db/schema/business-hours";
import { SelectTag } from "@/db/schema/tag";
import { ClearFilters, Filters } from "@/modules/marketing/filters";
import { OpenFilter } from "@/modules/marketing/open-filter";
import { Results } from "@/modules/marketing/results";
import { Search } from "@/modules/marketing/search";
import dashboard from "./dashboard/page";
import auth from "./auth/route";

const index = new Elysia({ name: "index-page" })
  .use(auth)
  .guard(
    {
      beforeHandle: ({ token, set }) => {
        if (!token) return (set.redirect = "/");
      },
    },
    (app) => app.use(dashboard),
  )
  .get(
    "/n",
    () => (
      <Notification title="SAPE" description="Lorem sape sape sape sape sape" />
    ),
    { afterHandle: () => console.log("======> ADSASDS?") },
  )
  .guard(
    {
      beforeHandle: ({ set }) => {
        /** Uncomment the following if this plugins starts pushing-urls */
        set.headers["Vary"] = "hx-request";
        set.headers["Cache-Control"] =
          "public, max-age=900, must-revalidate, stale-while-revalidate=120";
      },
    },
    (app) =>
      app
        .get(
          "/",
          async () => {
            const tags = await getTags();
            const businesses = await getBusinessesQuery({
              today: "true",
            });

            return (
              <MarketingTemplate>
                <Page tags={tags} initialData={businesses} />
                <button hx-get="/n" hx-swap="none">
                  Nofify me
                </button>{" "}
                <button _="on click log window.location">Log</button>
              </MarketingTemplate>
            );
          },
          {
            afterHandle: () => {
              console.log("=======> AFTER");
            },
          },
        )
        .get(
          "/q",
          async ({ query }) => {
            console.log(query);
            const businesses = await getBusinessesQuery(query);

            return (
              <>
                <ClearFilters tag={query.tag} />
                <Results businesses={businesses} />
              </>
            );
          },
          {
            query: t.Object({
              search: t.Optional(t.String()),
              tag: t.Optional(t.Numeric()),
              open: t.Optional(t.Literal("true")),
              today: t.Optional(t.Literal("true")),
            }),
          },
        ),
  );

// The page itself
const Page = ({
  tags,
  initialData,
}: {
  tags: SelectTag[];
  initialData: (SelectBusiness & {
    reviews: number | null;
    businessHours: SelectBusinessHours | null;
  })[];
}) => (
  <>
    <h1 class="mx-auto mt-12 max-w-xl select-none text-center font-heading text-2xl font-black leading-relaxed sm:text-4xl">
      ¿Estás c*gado de hambre?
    </h1>
    <h2 class="mx-auto max-w-xl py-4 text-center text-base font-light sm:text-lg">
      Caíste al lugar correcto. ¿Qué querés comer?
    </h2>

    {/* <div class="mt-4 space-y-2 lg:grid lg:grid-cols-3 lg:space-y-0"> */}
    <div class="mx-1 mb-2 flex gap-2 sm:mx-4">
      {/* Search bar */}
      <Search />
      {/* Open filter */}
      <OpenFilter />
    </div>
    {/* Tag filters */}
    <Filters tags={tags} />
    {/* </div> */}

    {/* List of businesses */}
    <Results businesses={initialData} />
  </>
);

export default index;