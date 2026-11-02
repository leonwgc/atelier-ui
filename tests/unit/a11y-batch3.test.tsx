import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Anchor } from '../../src/Anchor';
import { AutoComplete } from '../../src/AutoComplete';
import { Avatar } from '../../src/Avatar';
import { Badge } from '../../src/Badge';
import { Card } from '../../src/Card';
import { Carousel } from '../../src/Carousel';
import { Descriptions } from '../../src/Descriptions';
import { Empty } from '../../src/Empty';
import { Mentions } from '../../src/Mentions';
import { Popconfirm } from '../../src/Popconfirm';
import { Result } from '../../src/Result';
import { Skeleton } from '../../src/Skeleton';
import { Statistic } from '../../src/Statistic';
import { Tag } from '../../src/Tag';
import { Timeline } from '../../src/Timeline';
import { Tooltip } from '../../src/Tooltip';
import { Tour } from '../../src/Tour';
import { Transfer } from '../../src/Transfer';
import { Upload } from '../../src/Upload';

async function expectNoViolations(node: Element) {
  // jsdom has no layout/canvas, so contrast is checked in the browser instead.
  const results = await axe(node, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
}

describe('accessibility audit, third batch', () => {
  it('suggestion inputs have no violations closed and open', async () => {
    const { container } = render(<>
      <AutoComplete label="City" options={[{ value: 'Paris' }, { value: 'Rome' }]} />
      <Mentions label="Notes" options={[{ value: 'ann' }, { value: 'bob' }]} />
    </>);
    await expectNoViolations(container);
    await userEvent.click(container.querySelector('input')!);
    await expectNoViolations(document.body);
  });

  it('transfer and upload have no violations', async () => {
    const { container } = render(<>
      <Transfer dataSource={[{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' }]} targetKeys={['b']} />
      <Upload />
    </>);
    await expectNoViolations(container);
  });

  it('data display has no violations', async () => {
    const { container } = render(<>
      <Descriptions title="Info" items={[{ key: 'a', label: 'Name', children: 'Ann' }]} />
      <Timeline items={[{ key: 'a', content: 'Created' }, { key: 'b', content: 'Shipped' }]} />
      <Statistic title="Users" value={1280} />
      <Card title="Card">Body</Card>
      <Tag>New</Tag>
      <Badge count={3}><span>Inbox</span></Badge>
      <Avatar alt="Ann" />
      <Empty />
      <Skeleton active />
      <Result status="success" title="Done" />
    </>);
    await expectNoViolations(container);
  });

  it('navigation and carousel have no violations', async () => {
    const { container } = render(<>
      <Anchor items={[{ href: '#a', title: 'A' }, { href: '#b', title: 'B' }]} />
      <Carousel items={['One', 'Two', 'Three']} label="Gallery" />
    </>);
    await expectNoViolations(container);
  });

  it('tooltip, popconfirm and tour have no violations when open', async () => {
    const { container } = render(<>
      <Tooltip title="Hint"><button>Hover</button></Tooltip>
      <Popconfirm title="Sure?"><button>Delete</button></Popconfirm>
    </>);
    await userEvent.hover(container.querySelectorAll('button')[0]);
    await userEvent.click(container.querySelectorAll('button')[1]);
    await expectNoViolations(document.body);
    const tour = render(<Tour open steps={[{ title: 'Step one', description: 'Welcome' }]} />);
    await expectNoViolations(tour.baseElement);
  });
});
