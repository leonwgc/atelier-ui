import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Alert } from '../../src/Alert';
import { Breadcrumb } from '../../src/Breadcrumb';
import { Calendar } from '../../src/Calendar';
import { Checkbox } from '../../src/Checkbox';
import { Collapse } from '../../src/Collapse';
import { Input } from '../../src/Input';
import { InputNumber } from '../../src/InputNumber';
import { InputOTP } from '../../src/InputOTP';
import { Pagination } from '../../src/Pagination';
import { Progress } from '../../src/Progress';
import { Radio, RadioGroup } from '../../src/Radio';
import { Segmented } from '../../src/Segmented';
import { Slider } from '../../src/Slider';
import { Steps } from '../../src/Steps';
import { Switch } from '../../src/Switch';
import { Table } from '../../src/Table';
import { Textarea } from '../../src/Textarea';

async function expectNoViolations(container: Element) {
  // jsdom has no layout/canvas, so contrast is checked in the browser instead.
  const results = await axe(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
}

describe('accessibility audit, second batch', () => {
  it('form controls have no violations', async () => {
    const { container } = render(<>
      <Input label="Name" />
      <Textarea label="Notes" />
      <InputNumber label="Count" />
      <InputOTP aria-label="Code" length={4} />
      <Checkbox>Agree</Checkbox>
      <RadioGroup aria-label="Plan" options={[{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }]} />
      <Radio name="solo" value="x">Solo</Radio>
      <Switch aria-label="Notifications" />
      <Slider aria-label="Volume" defaultValue={20} />
      <Segmented aria-label="View" options={['Day', 'Week']} />
    </>);
    await expectNoViolations(container);
  });

  it('navigation and disclosure have no violations', async () => {
    const { container } = render(<>
      <Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'List' }]} />
      <Pagination current={2} pageSize={10} total={50} onChange={() => {}} />
      <Steps current={1} items={[{ title: 'One' }, { title: 'Two' }]} />
      <Collapse items={[{ key: 'a', title: 'Section', children: 'Content' }]} />
    </>);
    await expectNoViolations(container);
  });

  it('data display has no violations', async () => {
    const { container } = render(<>
      <Alert variant="info" title="Heads up" />
      <Progress percent={40} />
      <Calendar />
      <Table rowKey="id" columns={[{ key: 'name', title: 'Name', dataIndex: 'name', sorter: true }]} dataSource={[{ id: 1, name: 'A' }]} rowSelection={{ selectedRowKeys: [], onChange: () => {} }} expandable={{ expandedRowRender: () => 'More' }} />
    </>);
    await expectNoViolations(container);
  });
});
