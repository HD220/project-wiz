import { Trans } from "@lingui/react/macro";

export function SystemLabel() {
  return (
    <Trans id="common.system_name" comment="System Name">
      Project Wiz
    </Trans>
  );
}

export function ThemeLightLabel() {
  return (
    <Trans id="common.theme.light" comment="Light Theme">
      Light
    </Trans>
  );
}

export function ThemeDarkLabel() {
  return (
    <Trans id="common.theme.dark" comment="Dark Theme">
      Dark
    </Trans>
  );
}

export function ThemeSystemLabel() {
  return (
    <Trans id="common.theme.system" comment="System Theme">
      Auto
    </Trans>
  );
}
