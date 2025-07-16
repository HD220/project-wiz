import * as React from "react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCalendarClassNames } from "./calendar-styles";
import {
  CalendarRoot,
  CalendarChevron,
  CalendarWeekNumber,
} from "./calendar-components";
import { CalendarDayButton } from "./calendar-day-button";

export function Calendar(
  props: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  },
) {
  const {
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    ...rest
  } = props;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={getCalendarClassNames(
        buttonVariant,
        captionLayout,
        classNames || {},
      )}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <CalendarRoot
            className={className || ""}
            rootRef={rootRef}
            {...rootProps}
          />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => (
          <CalendarChevron
            className={className || ""}
            orientation={orientation || "right"}
            {...chevronProps}
          />
        ),
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, week, ...weekNumberProps }) => (
          <CalendarWeekNumber week={week} {...weekNumberProps}>
            {children || null}
          </CalendarWeekNumber>
        ),
        ...components,
      }}
      {...rest}
    />
  );
}
