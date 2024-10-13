import { Knex } from "knex";

import { AccountModel } from "../models/AccountModel";
import { GitRepositoryLinkModel } from "../models/GitRepositoryLinkModel";
import { SessionModel } from "../models/SessionModel";
import { UserModel } from "../models/UserModel";
import { VerificationTokenModel } from "../models/VerificationTokenModel";

declare module "knex/types/tables" {
  interface Tables {
    // This is same as specifying `knex<User>('users')`
    accounts: AccountModel;
    // sessions: SessionModel;
    // verification_tokens: VerificationTokenModel;
    // users: UserModel;
    // git_repository_links: GitRepositoryLinkModel;

    accounts: Knex.CompositeTableType<
      AccountModel,
      Omit<AccountModel, "id">,
      Partial<Omit<AccountModel, "id">>
    >;
    sessions: Knex.CompositeTableType<
      SessionModel,
      Omit<SessionModel, "id"> ,
      Partial<Omit<SessionModel, "id">>
    >;
    verification_tokens: Knex.CompositeTableType<
      VerificationTokenModel,
      Omit<VerificationTokenModel, "identifier" | "token" > ,
      Partial<Omit<VerificationTokenModel, "identifier" | "token">>
    >;
    users: Knex.CompositeTableType<
      UserModel,
      Omit<UserModel, "id"> ,
      Partial<Omit<UserModel, "id">>
    >;
    git_repository_links: Knex.CompositeTableType<
      GitRepositoryLinkModel,
      Omit<GitRepositoryLinkModel, "id">,
      Partial<Omit<GitRepositoryLinkModel, "id">>
    >;
  }
}
