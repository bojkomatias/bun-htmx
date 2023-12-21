import { insertBusinessForm } from "@/db/schema/business";
import { BusinessView } from "@/modules/business/business-view";
import setup from "@/config/setup";
import {
  updateBusiness,
  getBusinessWithRelations,
  getBusinessById,
} from "@/services/business";
import { Notification } from "@/ui/notification";
import Elysia, { Static } from "elysia";
import { Value } from "@sinclair/typebox/value";
import imageResizer from "@/utils/image-resize";

const BusinessIdRoute = new Elysia({ name: "business-id-route" })
  .use(setup)
  .put(
    "/:id",
    async ({ body, set, params: { id }, token }) => {
      const updated = await updateBusiness(parseInt(id), body);

      if (!updated) {
        set.status = 403;
        return (
          <Notification
            isError
            title="Error"
            description="Ocurrió un error al actualizar el negocio"
          />
        );
      }

      const business = await getBusinessWithRelations(parseInt(id));
      return (
        <>
          <Notification
            title="Actualizado"
            description="Negocio actualizado con éxito"
          />
          <BusinessView business={business} asAdmin={token?.role === "admin"} />
        </>
      );
    },
    {
      transform: async ({ body, params: { id } }) => {
        const business_data = await getBusinessById(parseInt(id));
        /** Transformation to match HTML to Insert
         * Mostly HTML returns string,
         * Here we convert types with typebox
         */
        const c = Value.Convert(insertBusinessForm, body) as Static<
          typeof insertBusinessForm
        >;
        // Object assign replaces object content body = c does not
        Object.assign(body, c);
        body.tags = [body.tags].flat().map((e: any) => JSON.parse(e));
        body.modality = body.modality
          ? [body.modality].flat().map((e: any) => JSON.parse(e).name)
          : null;
        //Resizes the image to make it lighter
        // @ts-ignore cause this is blob, upload occurs and then handler recibes de URI
        body.image = await imageResizer(
          // @ts-ignore
          body.image,
          body.name,
          business_data.image,
        ).then((res) => {
          return res.image_url;
        });
      },
      body: insertBusinessForm,
    },
  );

export default BusinessIdRoute;
