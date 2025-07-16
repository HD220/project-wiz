import { TableHead, TableHeader, TableRow } from "../../../components/ui/table";

export function LlmProviderTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Provider</TableHead>
        <TableHead>Model</TableHead>
        <TableHead>Default</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
