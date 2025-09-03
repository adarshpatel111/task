import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";

export const getMonthDays = (year: number, month: number) => {
  const start = startOfWeek(startOfMonth(new Date(year, month)), {
    weekStartsOn: 0,
  });
  const end = endOfWeek(endOfMonth(new Date(year, month)), { weekStartsOn: 0 });

  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    key: format(date, "yyyy-MM-dd"),
  }));
};
