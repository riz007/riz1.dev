import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || defaultLocale;

  return {
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});
