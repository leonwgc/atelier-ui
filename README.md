# Atelier UI

A React 18 component library and interactive Chinese demo, built with TypeScript.

## Development

```bash
npm install
npm run dev
```

The demo lives in `demo/`; reusable components and form hooks live in `src/`. The project uses one root `package.json` and does not use npm workspaces.

## Build

```bash
npm run typecheck
npm run build
```

`npm run build` creates the installable library in `dist/` and the static demo site in `demo-dist/`. The package is private to this project and is not published to the public npm registry. From another local project, install its packed artifact or local directory after building.

## Use the library

```tsx
import { useForm } from 'atelier-ui/form';
import { Button } from 'atelier-ui/button';
import { Input } from 'atelier-ui/input';

type Values = { name: string };

function Example() {
  const form = useForm<Values>({ defaultValues: { name: '' } });

  return (
    <form onSubmit={form.handleSubmit((values) => console.log(values))}>
      <Input label="Name" {...form.register('name', { required: 'Name is required' })} />
      <Button type="submit" variant="primary">Save</Button>
    </form>
  );
}
```

The form API is hook-first and inspired by React Hook Form. It does not provide Ant Design's `<Form>` or `<Form.Item>` components. Optional resolver adapters are exported from `atelier-ui/resolvers/zod` and `atelier-ui/resolvers/yup`; install the schema library used by your application separately.

The package exposes component subpaths (`atelier-ui/button`, `atelier-ui/table`, and others) for on-demand imports and tree-shaking. Each component module imports its own CSS automatically, along with the shared theme tokens it needs; no stylesheet import is required. Importing a component subpath loads only that component's styles and its component dependencies. Use a bundler that processes CSS imports (such as Vite, webpack, or Rspack).

## Components

- Button, Input, Textarea, Select, Alert, Tag, Avatar, Tooltip, Badge
- Breadcrumb, Tabs, Pagination, Divider
- Empty, Progress, Spin, Skeleton
- Card, Descriptions, Steps, Timeline, Collapse, Drawer
- DatePicker, Upload
- Checkbox, CheckboxGroup, Radio, RadioGroup, Switch
- Modal and `Modal.confirm`
- Table with local and server-controlled pagination, sorting, filtering, and row selection
- `useForm`, `useWatch`, `Controller`, `FormProvider`, `useFormContext`, `useFieldArray`
