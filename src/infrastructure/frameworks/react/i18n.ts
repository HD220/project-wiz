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
  const { messages: common } = await import(`./locales/${locale}/common.ts`);
  const { messages: validation } = await import(
    `./locales/${locale}/validation.ts`
  );
  const { messages: glossary } = await import(
    `./locales/${locale}/glossary.ts`
  );

  i18n.load({
    [locale]: {
      ...common,
      ...validation,
      ...glossary,
    },
  });

  i18n.activate(locale);
}
export { i18n };

