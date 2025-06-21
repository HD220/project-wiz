import { i18n } from "@lingui/core";
import {
  fromUrl,
  fromStorage,
  fromNavigator,
  detect,
} from "@lingui/detect-locale";

export const locales = {
  pt: "pt",
};

export const detectLocale = () =>
  detect(fromUrl("lang"), fromStorage("lang"), fromNavigator()) || "pt-BR";

export async function dynamicActivate(locale: string) {
  const defaultLocale = "pt-BR"; // Define a default/fallback locale
  let messagesToLoad: any = {};
  let loadedLocale = locale;

  try {
    // console.log(`Attempting to load messages for locale: ${locale}`);
    const { messages: common } = await import(`./locales/${locale}/common.ts`);
    const { messages: validation } = await import(`./locales/${locale}/validation.ts`);
    const { messages: glossary } = await import(`./locales/${locale}/glossary.ts`);
    messagesToLoad = { ...common, ...validation, ...glossary };
  } catch (e) {
    // console.error(`Failed to load messages for locale: ${locale}. Falling back to ${defaultLocale}.`, e);
    loadedLocale = defaultLocale;
    try {
      // Attempt to load fallback locale messages
      const { messages: common } = await import(`./locales/${defaultLocale}/common.ts`);
      const { messages: validation } = await import(`./locales/${defaultLocale}/validation.ts`);
      const { messages: glossary } = await import(`./locales/${defaultLocale}/glossary.ts`);
      messagesToLoad = { ...common, ...validation, ...glossary };
    } catch (fallbackError) {
      // console.error(`FATAL: Failed to load messages for fallback locale: ${defaultLocale}. App may not display text correctly.`, fallbackError);
      // At this point, messagesToLoad will be empty, and Lingui will use message IDs or default texts from <Trans>.
    }
  }

  if (Object.keys(messagesToLoad).length > 0) {
    i18n.load({
      [loadedLocale]: messagesToLoad,
    });
    i18n.activate(loadedLocale);
    // console.log(`Successfully activated locale: ${loadedLocale}`);
  } else {
    // Activate with an empty catalog for the target locale if all loads failed,
    // so Trans components can still render their default text or IDs.
    i18n.load({ [locale]: {} });
    i18n.activate(locale);
    // console.warn(`Activated locale ${locale} with empty catalog due to loading failures.`);
  }
}
export { i18n };

