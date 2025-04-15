export const db = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve([]),
    }),
  }),
  insert: () => ({
    values: () => Promise.resolve(),
  }),
  update: () => ({
    set: () => ({
      where: () => Promise.resolve(),
    }),
  }),
  delete: () => ({
    where: () => Promise.resolve(),
  }),
};