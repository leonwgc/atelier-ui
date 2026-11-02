import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Cascader } from '../../src/Cascader';
import { DatePicker } from '../../src/DatePicker';
import { Drawer } from '../../src/Drawer';
import { Dropdown } from '../../src/Dropdown';
import { List } from '../../src/List';
import { Menu } from '../../src/Menu';
import { Modal } from '../../src/Modal';
import { Popover } from '../../src/Popover';
import { Rate } from '../../src/Rate';
import { ColorPicker } from '../../src/ColorPicker';
import { Select } from '../../src/Select';
import { Tabs } from '../../src/Tabs';
import { TimePicker } from '../../src/TimePicker';
import { Tree } from '../../src/Tree';
import { TreeSelect } from '../../src/TreeSelect';

const options = [{ label: 'Alpha', value: 'a' }, { label: 'Beta', value: 'b' }];
const treeData = [{ key: 'r', title: 'Root', children: [{ key: 'a', title: 'Alpha' }] }];

async function expectNoViolations(node: Element | Document) {
  // jsdom has no layout/canvas, so contrast is checked in the browser UI tests instead.
  const results = await axe(node as Element, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
}

describe('accessibility audit', () => {
  it('Select has no violations closed and open', async () => {
    const { container } = render(<Select label="Project" options={options} />);
    await expectNoViolations(container);
    await userEvent.click(container.querySelector('[role="combobox"]')!);
    await expectNoViolations(document.body);
  });

  it('Cascader has no violations', async () => {
    const { container } = render(<Cascader aria-label="Area" options={[{ label: 'Parent', value: 'p', children: [{ label: 'Child', value: 'c' }] }]} />);
    await expectNoViolations(container);
    await userEvent.click(container.querySelector('[role="combobox"]')!);
    await expectNoViolations(document.body);
  });

  it('TreeSelect has no violations', async () => {
    const { container } = render(<TreeSelect aria-label="Node" treeData={[{ label: 'Root', value: 'root', children: [{ label: 'Leaf', value: 'leaf' }] }]} />);
    await expectNoViolations(container);
    await userEvent.click(container.querySelector('[role="combobox"]')!);
    await expectNoViolations(document.body);
  });

  it('DatePicker and TimePicker have no violations', async () => {
    const { container } = render(<><DatePicker label="Date" /><TimePicker label="Time" defaultValue="10:00" /></>);
    await expectNoViolations(container);
  });

  it('Tree has no violations', async () => {
    const { container } = render(<Tree aria-label="Files" treeData={treeData} checkable defaultExpandAll />);
    await expectNoViolations(container);
  });

  it('Menu has no violations', async () => {
    const { container } = render(<Menu aria-label="Main" items={[{ key: 'a', label: 'Alpha' }, { key: 'g', label: 'Group', children: [{ key: 'c', label: 'Child' }] }]} />);
    await expectNoViolations(container);
  });

  it('Rate, ColorPicker and List have no violations', async () => {
    const { container } = render(<>
      <Rate aria-label="Score" defaultValue={2} allowHalf />
      <ColorPicker defaultValue="#ff0000" />
      <List dataSource={['One']} renderItem={(item) => <List.Item>{item}</List.Item>} />
    </>);
    await expectNoViolations(container);
  });

  it('Tabs has no violations', async () => {
    const { container } = render(<Tabs items={[{ key: 'a', label: 'A', children: 'Panel A' }, { key: 'b', label: 'B', children: 'Panel B' }]} />);
    await expectNoViolations(container);
  });

  it('Modal and Drawer have no violations when open', async () => {
    render(<><Modal open title="Confirm" onClose={() => {}}>Body</Modal><Drawer open title="Panel" onClose={() => {}}>Body</Drawer></>);
    await expectNoViolations(document.body);
  });

  it('Popover and Dropdown have no violations when open', async () => {
    const { container } = render(<>
      <Popover content="Panel" title="Details"><button>Open</button></Popover>
      <Dropdown items={[{ key: 'a', label: 'Action' }]}><button>Menu</button></Dropdown>
    </>);
    await userEvent.click(container.querySelectorAll('button')[0]);
    await userEvent.click(container.querySelectorAll('button')[1]);
    await expectNoViolations(document.body);
  });
});
