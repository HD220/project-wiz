import type { RepositoryLink } from "@/infra/services/knex/models/RepositoryLink";

declare module "knex/types/tables" {
  // interface githubProject extends GithubProjects

  interface Tables {
    // This is same as specifying `knex<User>('users')`
    git_repository_links: RepositoryLink;
    // For more advanced types, you can specify separate type
    // for base model, "insert" type and "update" type.
    // But first: notice that if you choose to use this,
    // the basic typing showed above can be ignored.
    // So, this is like specifying
    //    knex
    //    .insert<{ name: string }>({ name: 'name' })
    //    .into<{ name: string, id: number }>('users')
    // users_composite: Knex.CompositeTableType<
    //   // This interface will be used for return type and
    //   // `where`, `having` etc where full type is required
    //   GithubProjects,
    //   // Specifying "insert" type will also make sure
    //   // data matches interface in full. Meaning
    //   // if interface is `{ a: string, b: string }`,
    //   // `insert({ a: '' })` will complain about missing fields.
    //   //
    //   // For example, this will require only "name" field when inserting
    //   // and make created_at and updated_at optional.
    //   // And "id" can't be provided at all.
    //   // Defaults to "base" type.
    //   Pick<GithubProjects, "id"> &
    //     Partial<Pick<GithubProjects, "created_at" | "updated_at">>,
    //   // This interface is used for "update()" calls.
    //   // As opposed to regular specifying interface only once,
    //   // when specifying separate update interface, user will be
    //   // required to match it  exactly. So it's recommended to
    //   // provide partial interfaces for "update". Unless you want to always
    //   // require some field (e.g., `Partial<User> & { updated_at: string }`
    //   // will allow updating any field for User but require updated_at to be
    //   // always provided as well.
    //   //
    //   // For example, this wil allow updating all fields except "id".
    //   // "id" will still be usable for `where` clauses so
    //   //      knex('users_composite')
    //   //      .update({ name: 'name2' })
    //   //      .where('id', 10)`
    //   // will still work.
    //   // Defaults to Partial "insert" type
    //   Partial<Omit<GithubProjects, "id">>
    // >;
  }
}
