import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher';
import { FilesystemService } from './filesystem.service';
import { ReadFileQuery, ReadFileQueryHandler } from './application/queries/read-file.query';
import { WriteFileCommand, WriteFileCommandHandler } from './application/commands/write-file.command';
import { ListDirectoryQuery, ListDirectoryQueryHandler } from './application/queries/list-directory.query';
import { SearchFileContentQuery, SearchFileContentQueryHandler } from './application/queries/search-file-content.query';

export function registerFilesystemToolsModule(cqrsDispatcher: CqrsDispatcher) {
  // TODO: Pass the actual project base directory
  const filesystemService = new FilesystemService('./');

  const readFileQueryHandler = new ReadFileQueryHandler(filesystemService);
  const writeFileCommandHandler = new WriteFileCommandHandler(filesystemService);
  const listDirectoryQueryHandler = new ListDirectoryQueryHandler(filesystemService);
  const searchFileContentQueryHandler = new SearchFileContentQueryHandler(filesystemService);

  cqrsDispatcher.registerQueryHandler(ReadFileQuery.name, readFileQueryHandler.handle.bind(readFileQueryHandler));
  cqrsDispatcher.registerCommandHandler(WriteFileCommand.name, writeFileCommandHandler.handle.bind(writeFileCommandHandler));
  cqrsDispatcher.registerQueryHandler(ListDirectoryQuery.name, listDirectoryQueryHandler.handle.bind(listDirectoryQueryHandler));
  cqrsDispatcher.registerQueryHandler(SearchFileContentQuery.name, searchFileContentQueryHandler.handle.bind(searchFileContentQueryHandler));
}
