import { useDemoLocale, translateDemoValue } from './locale';
import { useState, type ReactNode } from 'react';
import {
  AutoComplete, Cascader, ColorPicker, InputNumber, Mentions, Rate, Segmented, Select, Slider, TimePicker, Transfer, TreeSelect,
  type AutoCompleteOption, type CascaderOption, type SelectOption, type TransferItem, type TreeSelectNode,
} from '../src';
import { ApiTable, ExampleCard, PageHeading } from './shared';

export type DataEntryPageId = 'select' | 'autoComplete' | 'inputNumber' | 'rate' | 'slider' | 'segmented' | 'timePicker' | 'colorPicker' | 'mentions' | 'cascader' | 'treeSelect' | 'transfer';

interface Example { title: string; description?: string; code: string; preview: ReactNode }
interface DataEntryPageMeta {
  id: DataEntryPageId;
  title: string;
  icon: string;
  group: string;
  badge: string;
  description: string;
  examples: Example[];
  rows: string[][];
}

const roles: SelectOption[] = [
  { label: '产品设计师', value: 'designer', description: '负责界面与体验' },
  { label: '前端工程师', value: 'frontend', description: '负责组件与页面实现' },
  { label: '后端工程师', value: 'backend' },
  { label: '产品经理', value: 'pm' },
  { label: '访客（只读）', value: 'guest', disabled: true },
];
const channels: SelectOption[] = [{ label: '邮件通知', value: 'email' }, { label: '站内消息', value: 'in-app' }, { label: 'Slack', value: 'slack' }, { label: '企业微信', value: 'wecom' }, { label: '短信', value: 'sms' }];
const groupedRoles = [
  { label: '设计', options: [{ label: '产品设计师', value: 'designer' }, { label: '品牌设计师', value: 'brand' }] },
  { label: '研发', options: [{ label: '前端工程师', value: 'frontend' }, { label: '后端工程师', value: 'backend' }, { label: '测试工程师', value: 'qa' }] },
];
const members: AutoCompleteOption[] = [
  { value: '林知夏', description: 'lin@atelier.design · 设计' },
  { value: '陈一川', description: 'chen@atelier.design · 前端' },
  { value: '周禾', description: 'zhou@atelier.design · 产品' },
  { value: '沈星河', description: 'shen@atelier.design · 后端' },
];
const regions: CascaderOption[] = [
  { label: '中国', value: 'cn', children: [
    { label: '上海', value: 'sh', children: [{ label: '徐汇区', value: 'xuhui' }, { label: '长宁区', value: 'changning' }, { label: '浦东新区', value: 'pudong' }] },
    { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xihu' }, { label: '余杭区', value: 'yuhang' }] },
    { label: '成都', value: 'cd', disabled: true },
  ] },
  { label: '新加坡', value: 'sg', children: [{ label: '中央区', value: 'central' }] },
];
const teams: TreeSelectNode[] = [
  { label: '设计部', value: 'design', children: [{ label: '品牌组', value: 'brand' }, { label: '体验组', value: 'ux' }] },
  { label: '工程部', value: 'engineering', children: [
    { label: '前端组', value: 'frontend', children: [{ label: 'Web 小组', value: 'web' }, { label: '移动端小组', value: 'mobile' }] },
    { label: '后端组', value: 'backend' },
  ] },
  { label: '市场部', value: 'marketing', disabled: true },
];
const transferMembers: TransferItem[] = [
  { key: 'lin', title: '林知夏', description: '设计' },
  { key: 'chen', title: '陈一川', description: '前端' },
  { key: 'zhou', title: '周禾', description: '产品' },
  { key: 'shen', title: '沈星河', description: '后端' },
  { key: 'guest', title: '访客账号', disabled: true },
];

function ControlledSelect() {
  const { t: dt } = useDemoLocale();
  const localizedRoles = translateDemoValue(roles, dt);

  const [role, setRole] = useState('frontend');
  return <div className="input-demo-grid">
    <Select label={dt("团队角色")} options={localizedRoles} value={role} onChange={(value) => setRole(value as string)} hint={dt("当前值：{0}", { 0: role || dt("未选择") })} allowClear />
    <Select label={dt("禁用状态")} options={localizedRoles} defaultValue="pm" disabled />
  </div>;
}
function MultipleSelect() {
  const { t: dt } = useDemoLocale();
  const localizedChannels = translateDemoValue(channels, dt);

  const [selected, setSelected] = useState<string[]>(['email', 'in-app']);
  return <div className="input-demo-grid">
    <Select label={dt("通知渠道")} options={localizedChannels} multiple searchable value={selected} onChange={(value) => setSelected(value as string[])} placeholder={dt("选择通知渠道")} />
    <Select label={dt("折叠超出的标签")} options={localizedChannels} multiple defaultValue={['email', 'in-app', 'slack', 'wecom']} maxTagCount={2} />
  </div>;
}
function CustomSelect() {
  const { t: dt } = useDemoLocale();
  const localizedGroupedRoles = translateDemoValue(groupedRoles, dt);
  const localizedRoles = translateDemoValue(roles, dt);

  return <div className="input-demo-grid">
    <Select label={dt("分组 + 搜索")} options={localizedGroupedRoles} searchable placeholder={dt("搜索角色")} />
    <Select
      label={dt("自定义选项渲染")}
      options={localizedRoles}
      defaultValue="designer"
      popupClassName="demo-select-popup"
      optionRender={(option, { selected }) => <span className="demo-option"><span className="demo-option__avatar" aria-hidden="true">{option.label.slice(0, 1)}</span><span className="demo-option__body"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>{selected && <span className="demo-option__mark">✓</span>}</span>}
      popupRender={(menu) => <>{menu}<div className="at-popup__footer demo-popup-footer"><span>{dt("找不到合适的角色？")}</span><button type="button" onClick={() => window.alert(dt("新建角色"))}>{dt("新建角色")}</button></div></>}
    />
  </div>;
}

function BasicAutoComplete() {
  const { t: dt } = useDemoLocale();

  const [value, setValue] = useState('');
  return <div className="input-demo-grid">
    <AutoComplete label={dt("负责人")} options={[dt("林知夏"), dt("陈一川"), dt("周禾"), dt("沈星河")]} value={value} onChange={setValue} placeholder={dt("搜索或输入姓名")} allowClear hint={value ? dt("当前输入：{0}", { 0: value }) : dt("支持键盘 ↑ ↓ 选择，Enter 确认")} />
    <AutoComplete label={dt("邮箱后缀补全")} options={value.includes('@') ? [] : ['gmail.com', 'outlook.com', 'atelier.design'].map((domain) => `${value || 'name'}@${domain}`)} filterOption={false} placeholder={dt("输入邮箱前缀")} onSelect={(selected) => setValue(selected)} />
  </div>;
}
function StyledAutoComplete() {
  const { t: dt } = useDemoLocale();
  const localizedMembers = translateDemoValue(members, dt);

  return <div className="input-demo-grid">
    <AutoComplete
      label={dt("自定义弹层风格")}
      options={localizedMembers}
      placeholder={dt("搜索团队成员")}
      popupClassName="demo-dark-popup"
      popupMatchSelectWidth={false}
      popupStyle={{ minWidth: 320 }}
      optionRender={(option, { active }) => <span className={`demo-member ${active ? 'demo-member--active' : ''}`}><span className="demo-member__avatar">{option.value.slice(0, 1)}</span><span className="demo-member__body"><strong>{option.value}</strong><small>{option.description}</small></span></span>}
      popupRender={(menu) => <><div className="demo-dark-popup__title">{dt("团队成员")}</div>{menu}<div className="demo-dark-popup__footer">{dt("↑ ↓ 切换 · Enter 选择 · Esc 关闭")}</div></>}
    />
    <AutoComplete label={dt("不匹配时的提示")} options={[dt("设计评审"), dt("发布计划"), dt("周会纪要")]} notFoundContent={dt("没有找到相关文档")} placeholder={dt("搜索文档")} status="warning" hint={dt("status=warning 时边框会变为警示色")} />
  </div>;
}

function BasicInputNumber() {
  const { t: dt } = useDemoLocale();

  const [count, setCount] = useState<number | null>(8);
  return <div className="input-demo-grid">
    <InputNumber label={dt("团队人数")} min={1} max={100} value={count} onChange={setCount} hint={dt("当前：{0} 人", { 0: count ?? dt("空") })} />
    <InputNumber label={dt("预算（万元）")} min={0} step={0.5} precision={1} defaultValue={12.5} prefix="¥" controls="inline" />
    <InputNumber label={dt("折扣")} min={0} max={100} defaultValue={85} formatter={(value) => `${value}%`} parser={(text) => Number(text.replace('%', ''))} />
    <InputNumber label={dt("禁用")} defaultValue={3} disabled />
  </div>;
}

function BasicRate() {
  const { t: dt } = useDemoLocale();

  const [score, setScore] = useState(4);
  return <div className="component-row component-row--align-end" style={{ gap: 36 }}>
    <div><span className="demo-hint">{dt("基础评分 · 当前")}{score} {dt("分")}</span><br /><Rate value={score} onChange={setScore} /></div>
    <div><span className="demo-hint">{dt("半星 + 文案")}</span><br /><Rate allowHalf defaultValue={3.5} tooltips={[dt("很差"), dt("较差"), dt("一般"), dt("不错"), dt("很棒")]} /></div>
    <div><span className="demo-hint">{dt("只读 / 小尺寸")}</span><br /><Rate defaultValue={5} disabled size="sm" label={dt("历史评分")} tooltips={[dt("1 分"), dt("2 分"), dt("3 分"), dt("4 分"), dt("5 分")]} /></div>
    <div><span className="demo-hint">{dt("自定义字符")}</span><br /><Rate defaultValue={2} label={dt("喜爱程度")} tooltips={[dt("一颗心"), dt("两颗心"), dt("三颗心"), dt("四颗心"), dt("五颗心")]} character={<span style={{ fontSize: 24, lineHeight: 1 }}>♥</span>} /></div>
  </div>;
}

function BasicSlider() {
  const { t: dt } = useDemoLocale();

  const [opacity, setOpacity] = useState(72);
  const [range, setRange] = useState<[number, number]>([20, 60]);
  return <div className="demo-stack" style={{ display: 'grid', gap: 28, maxWidth: 520 }}>
    <Slider label={dt("透明度")} showValue value={opacity} onChange={setOpacity} tooltipFormatter={(value) => `${value}%`} />
    <Slider label={dt("预算区间")} showValue range value={range} onChange={setRange} min={0} max={100} step={5} />
    <Slider label={dt("满意度")} marks={{ 0: dt("很差"), 25: dt("较差"), 50: dt("一般"), 75: dt("不错"), 100: dt("很棒") }} step={null} defaultValue={75} tooltip="none" />
    <Slider label={dt("禁用")} defaultValue={40} disabled />
  </div>;
}

function BasicSegmented() {
  const { t: dt } = useDemoLocale();

  const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');
  return <div className="demo-stack" style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
    <Segmented options={[{ label: dt("列表"), value: 'list' }, { label: dt("看板"), value: 'board' }, { label: dt("日历"), value: 'calendar' }]} value={view} onChange={setView} />
    <Segmented options={[{ label: dt("周"), value: 'week', icon: '▤' }, { label: dt("月"), value: 'month', icon: '▦' }, { label: dt("季度"), value: 'quarter', icon: '▧', disabled: true }]} defaultValue="month" size="sm" shape="round" />
    <Segmented options={[dt("全部"), dt("进行中"), dt("已完成")]} block style={{ width: 360 }} size="lg" />
    <span className="demo-hint">{dt("当前视图：")}{view}</span>
  </div>;
}

function BasicTimePicker() {
  const { t: dt } = useDemoLocale();

  const [time, setTime] = useState<string | null>('14:30');
  return <div className="input-demo-grid">
    <TimePicker label={dt("会议时间")} value={time} onChange={setTime} minTime="09:00" maxTime="18:00" hint={time ? dt("已选择 {0}", { 0: time }) : dt("09:00 – 18:00 之间")} />
    <TimePicker label={dt("精确到秒")} format="HH:mm:ss" defaultValue="08:15:30" secondStep={15} />
    <TimePicker label={dt("15 分钟间隔")} minuteStep={15} placeholder={dt("选择时段")} showNow={false} />
    <TimePicker label={dt("禁用")} defaultValue="10:00" disabled />
  </div>;
}

function BasicColorPicker() {
  const { t: dt } = useDemoLocale();

  const [color, setColor] = useState('#685cf6');
  return <div className="input-demo-grid">
    <ColorPicker label={dt("品牌主色")} value={color} onChange={setColor} presets={['#685cf6', '#2f9472', '#c98a29', '#d94d64', '#222438', '#9298aa']} hint={dt("当前：{0}", { 0: color })} />
    <ColorPicker label={dt("带透明度 · RGB")} defaultValue="#2f947299" showAlpha format="rgb" />
    <div className="component-row component-row--align-end"><ColorPicker label={dt("仅色块")} defaultValue="#c98a29" showText={false} /><ColorPicker label={dt("可清除")} defaultValue="#d94d64" allowClear size="sm" /></div>
    <div className="at-field"><span className="at-field__label">{dt("实时预览")}</span><div className="demo-color-preview" style={{ background: color }} aria-hidden="true" /></div>
  </div>;
}

function BasicMentions() {
  const { t: dt } = useDemoLocale();
  const localizedMembers = translateDemoValue(members, dt);

  const [text, setText] = useState(dt("@林知夏 请确认设计稿"));
  return <div className="textarea-demo demo-stack" style={{ display: 'grid', gap: 18 }}>
    <Mentions label={dt("项目留言")} options={localizedMembers.map((member) => ({ value: member.value, description: member.description }))} value={text} onChange={setText} autoSize={{ minRows: 3, maxRows: 6 }} hint={dt("输入 @ 选择成员")} />
    <Mentions label={dt("多种触发符")} options={[dt("林知夏"), dt("陈一川"), dt("周禾")]} prefix={['@', '#']} placeholder={dt("@ 提及成员，# 关联话题")} rows={2} filterOption={(query, option) => option.value.includes(query)} />
  </div>;
}

function BasicCascader() {
  const { t: dt } = useDemoLocale();
  const localizedRegions = translateDemoValue(regions, dt);

  const [path, setPath] = useState<string[]>(['cn', 'sh', 'xuhui']);
  return <div className="input-demo-grid">
    <Cascader label={dt("所在地区")} options={localizedRegions} value={path} onChange={setPath} hint={dt("已选：{0}", { 0: path.join(' / ') || dt("无") })} />
    <Cascader label={dt("悬停展开 + 搜索")} options={localizedRegions} expandTrigger="hover" showSearch placeholder={dt("搜索城市或区县")} />
    <Cascader label={dt("允许选择任意一级")} options={localizedRegions} changeOnSelect defaultValue={['cn', 'hz']} displayRender={(labels) => labels.join(' › ')} />
    <Cascader label={dt("禁用")} options={localizedRegions} defaultValue={['sg', 'central']} disabled />
  </div>;
}

function BasicTreeSelect() {
  const { t: dt } = useDemoLocale();
  const localizedTeams = translateDemoValue(teams, dt);

  const [team, setTeam] = useState('web');
  const [checked, setChecked] = useState<string[]>(['ux']);
  return <div className="input-demo-grid">
    <TreeSelect label={dt("所属团队")} treeData={localizedTeams} value={team} onChange={(value) => setTeam(value as string)} showSearch hint={dt("当前：{0}", { 0: team })} />
    <TreeSelect label={dt("多选可勾选")} treeData={localizedTeams} treeCheckable value={checked} onChange={(value) => setChecked(value as string[])} treeDefaultExpandAll placeholder={dt("选择参与团队")} />
    <TreeSelect label={dt("默认展开指定节点")} treeData={localizedTeams} treeDefaultExpandedKeys={['engineering']} placeholder={dt("请选择团队")} size="sm" />
    <TreeSelect label={dt("禁用")} treeData={localizedTeams} defaultValue="brand" disabled />
  </div>;
}

function BasicTransfer() {
  const { t: dt } = useDemoLocale();
  const localizedTransferMembers = translateDemoValue(transferMembers, dt);

  const [targets, setTargets] = useState<string[]>(['lin']);
  return <div className="demo-stack" style={{ display: 'grid', gap: 24 }}>
    <Transfer dataSource={localizedTransferMembers} targetKeys={targets} onChange={(keys, direction, moved) => { setTargets(keys); console.info(direction, moved); }} titles={[dt("可选成员"), dt("项目成员")]} />
    <Transfer dataSource={localizedTransferMembers} defaultTargetKeys={['chen', 'zhou']} showSearch oneWay titles={[dt("成员库"), dt("已加入")]} operations={[dt("加入项目"), dt("移出项目")]} render={(item) => <span>{item.title}<span className="demo-hint"> · {item.description ?? dt("未分组")}</span></span>} footer={(direction, info) => dt("{0} {1} 人", { 0: direction === 'left' ? dt("可选") : dt("已选"), 1: info.total })} />
  </div>;
}

export const dataEntryPages: DataEntryPageMeta[] = [
  {
    id: 'select', title: 'Select 选择器', icon: '⌄', group: '数据录入', badge: 'Select', description: '自绘的下拉选择器，支持搜索、多选、分组、自定义选项与弹层内容。',
    examples: [
      { title: '基础用法', description: '受控与非受控、清除与禁用。', preview: <ControlledSelect />, code: `import { useState } from 'react';
import { Select } from 'atelier-ui/select';

const roles = [
  { label: '产品设计师', value: 'designer', description: '负责界面与体验' },
  { label: '前端工程师', value: 'frontend' },
  { label: '产品经理', value: 'pm' },
  { label: '访客（只读）', value: 'guest', disabled: true },
];

export function RolePicker() {
  const [role, setRole] = useState('frontend');
  return (
    <>
      <Select label="团队角色" options={roles} value={role} onChange={(value) => setRole(value as string)} allowClear />
      <Select label="禁用状态" options={roles} defaultValue="pm" disabled />
    </>
  );
}` },
      { title: '多选与标签折叠', description: '多选以标签呈现，可配合搜索与 maxTagCount。', preview: <MultipleSelect />, code: `import { useState } from 'react';
import { Select } from 'atelier-ui/select';

const channels = [
  { label: '邮件通知', value: 'email' },
  { label: '站内消息', value: 'in-app' },
  { label: 'Slack', value: 'slack' },
  { label: '企业微信', value: 'wecom' },
];

export function ChannelPicker() {
  const [selected, setSelected] = useState<string[]>(['email', 'in-app']);
  return (
    <>
      <Select label="通知渠道" options={channels} multiple searchable value={selected} onChange={(value) => setSelected(value as string[])} />
      <Select label="折叠超出的标签" options={channels} multiple defaultValue={['email', 'in-app', 'slack']} maxTagCount={2} />
    </>
  );
}` },
      { title: '分组、自定义选项与弹层', description: '通过 optionRender 与 popupRender 定制下拉内容。', preview: <CustomSelect />, code: `import { Select } from 'atelier-ui/select';

const grouped = [
  { label: '设计', options: [{ label: '产品设计师', value: 'designer' }, { label: '品牌设计师', value: 'brand' }] },
  { label: '研发', options: [{ label: '前端工程师', value: 'frontend' }, { label: '后端工程师', value: 'backend' }] },
];

export function GroupedRoles() {
  return (
    <>
      <Select label="分组 + 搜索" options={grouped} searchable />
      <Select
        label="自定义选项渲染"
        options={grouped[1].options}
        optionRender={(option, { selected }) => (
          <span className="option">
            <strong>{option.label}</strong>
            {selected && <span>✓</span>}
          </span>
        )}
        popupRender={(menu) => (
          <>
            {menu}
            <div className="at-popup__footer">
              <button type="button">新建角色</button>
            </div>
          </>
        )}
      />
    </>
  );
}` },
    ],
    rows: [['options', 'Array<SelectOption | SelectOptionGroup>', 'required'], ['value / defaultValue', 'string | string[]', '—'], ['onChange', '(value, option) => void', '—'], ['multiple / searchable', 'boolean', 'false'], ['allowClear', 'boolean', 'false'], ['maxTagCount', 'number', '—'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['placeholder', 'string', "'请选择…'"], ['notFoundContent', 'ReactNode', "'暂无匹配选项'"], ['open / onOpenChange', 'boolean / (open) => void', '—'], ['placement', 'PopupPlacement', "'bottom-start'"], ['popupClassName / popupStyle', 'string / CSSProperties', '—'], ['popupMatchSelectWidth', 'boolean', 'true'], ['popupRender', '(menu) => ReactNode', '—'], ['optionRender', '(option, { active, selected, query }) => ReactNode', '—'], ['labelRender', '(option) => ReactNode', '—']],
  },
  {
    id: 'autoComplete', title: 'AutoComplete 自动完成', icon: '⌕', group: '数据录入', badge: 'AutoComplete', description: '输入时提供匹配建议，弹层完全自绘，可自由定制风格与内容。',
    examples: [
      { title: '基础用法', description: '本地过滤、关键字高亮与键盘导航。', preview: <BasicAutoComplete />, code: `import { useState } from 'react';
import { AutoComplete } from 'atelier-ui/auto-complete';

export function OwnerSearch() {
  const [value, setValue] = useState('');
  return (
    <>
      <AutoComplete label="负责人" options={['林知夏', '陈一川', '周禾']} value={value} onChange={setValue} allowClear placeholder="搜索或输入姓名" />
      <AutoComplete
        label="邮箱后缀补全"
        filterOption={false}
        options={value.includes('@') ? [] : ['gmail.com', 'outlook.com'].map((domain) => \`\${value || 'name'}@\${domain}\`)}
        onSelect={(selected) => setValue(selected)}
      />
    </>
  );
}` },
      { title: '自定义弹层风格', description: 'popupClassName、popupStyle、optionRender 与 popupRender 组合出完全不同的视觉。', preview: <StyledAutoComplete />, code: `import { AutoComplete } from 'atelier-ui/auto-complete';

const members = [
  { value: '林知夏', description: 'lin@atelier.design · 设计' },
  { value: '陈一川', description: 'chen@atelier.design · 前端' },
];

export function MemberSearch() {
  return (
    <AutoComplete
      label="搜索团队成员"
      options={members}
      popupClassName="member-popup"
      popupMatchSelectWidth={false}
      popupStyle={{ minWidth: 320 }}
      optionRender={(option, { active }) => (
        <span className={active ? 'member member--active' : 'member'}>
          <span className="member__avatar">{option.value.slice(0, 1)}</span>
          <span><strong>{option.value}</strong><small>{option.description}</small></span>
        </span>
      )}
      popupRender={(menu) => (
        <>
          <div className="member-popup__title">团队成员</div>
          {menu}
          <div className="member-popup__footer">↑ ↓ 切换 · Enter 选择</div>
        </>
      )}
    />
  );
}

/* .member-popup { background: #1d1f33; color: #fff; border-color: transparent; }
   .member-popup .at-option--active { background: rgb(255 255 255 / 10%); } */` },
    ],
    rows: [['options', 'Array<string | AutoCompleteOption>', 'required'], ['value / defaultValue', 'string', "— / ''"], ['onChange', '(value: string) => void', '—'], ['onSelect', '(value, option) => void', '—'], ['onSearch', '(query) => void', '—'], ['filterOption', 'boolean | (query, option) => boolean', 'true'], ['highlight', 'boolean', 'true'], ['allowClear', 'boolean', 'false'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['prefix / suffix', 'ReactNode', '—'], ['notFoundContent', 'ReactNode', 'null'], ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', '—'], ['placement', 'PopupPlacement', "'bottom-start'"], ['popupClassName / popupStyle', 'string / CSSProperties', '—'], ['popupMatchSelectWidth', 'boolean', 'true'], ['popupRender', '(menu) => ReactNode', '—'], ['optionRender', '(option, { active, query }) => ReactNode', '—']],
  },
  {
    id: 'inputNumber', title: 'InputNumber 数字输入框', icon: '#', group: '数据录入', badge: 'InputNumber', description: '按范围、步长与精度录入数值，支持长按步进、键盘调节与格式化显示。',
    examples: [
      { title: '基础用法', description: '受控数值、精度、前缀、格式化与禁用。', preview: <BasicInputNumber />, code: `import { useState } from 'react';
import { InputNumber } from 'atelier-ui/input-number';

export function TeamCapacity() {
  const [count, setCount] = useState<number | null>(8);
  return (
    <>
      <InputNumber label="团队人数" min={1} max={100} value={count} onChange={setCount} />
      <InputNumber label="预算（万元）" min={0} step={0.5} precision={1} defaultValue={12.5} prefix="¥" controls="inline" />
      <InputNumber label="折扣" min={0} max={100} defaultValue={85} formatter={(value) => \`\${value}%\`} parser={(text) => Number(text.replace('%', ''))} />
    </>
  );
}` },
    ],
    rows: [['value / defaultValue', 'number | null', '— / null'], ['onChange', '(value: number | null) => void', '—'], ['min / max', 'number', '-∞ / ∞'], ['step', 'number', '1'], ['precision', 'number', '由 step 推断'], ['controls', "boolean | 'stacked' | 'inline'", "'stacked'"], ['keyboard', 'boolean', 'true'], ['formatter / parser', '(value) => string / (text) => number | null', '—'], ['prefix / suffix', 'ReactNode', '—'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['disabled / readOnly', 'boolean', 'false']],
  },
  {
    id: 'rate', title: 'Rate 评分', icon: '★', group: '数据录入', badge: 'Rate', description: '以星级收集评分，支持半星、文案提示、自定义字符与键盘操作。',
    examples: [
      { title: '基础用法', description: '受控评分、半星、只读与自定义字符。', preview: <BasicRate />, code: `import { useState } from 'react';
import { Rate } from 'atelier-ui/rate';

export function Satisfaction() {
  const [score, setScore] = useState(4);
  return (
    <>
      <Rate value={score} onChange={setScore} />
      <Rate allowHalf defaultValue={3.5} tooltips={['很差', '较差', '一般', '不错', '很棒']} />
      <Rate defaultValue={5} disabled size="sm" />
      <Rate defaultValue={2} character={<span>♥</span>} />
    </>
  );
}` },
    ],
    rows: [['value / defaultValue', 'number', '— / 0'], ['onChange', '(value: number) => void', '—'], ['onHoverChange', '(value: number | null) => void', '—'], ['count', 'number', '5'], ['allowHalf', 'boolean', 'false'], ['allowClear', 'boolean', 'true'], ['disabled', 'boolean', 'false'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['character', 'ReactNode | (index) => ReactNode', '★'], ['tooltips', 'string[]', '—'], ['label', 'string', "'评分'"]],
  },
  {
    id: 'slider', title: 'Slider 滑动输入条', icon: '━', group: '数据录入', badge: 'Slider', description: '在数值区间内拖动取值，支持双滑块范围、刻度标记、提示气泡与键盘微调。',
    examples: [
      { title: '基础用法', description: '单值、范围、刻度吸附与禁用。', preview: <BasicSlider />, code: `import { useState } from 'react';
import { Slider } from 'atelier-ui/slider';

export function OpacitySetting() {
  const [opacity, setOpacity] = useState(72);
  const [range, setRange] = useState<[number, number]>([20, 60]);
  return (
    <>
      <Slider label="透明度" showValue value={opacity} onChange={setOpacity} tooltipFormatter={(value) => \`\${value}%\`} />
      <Slider label="预算区间" showValue range value={range} onChange={setRange} step={5} />
      <Slider label="满意度" marks={{ 0: '很差', 50: '一般', 100: '很棒' }} step={null} defaultValue={50} tooltip="none" />
    </>
  );
}` },
    ],
    rows: [['value / defaultValue', 'number | [number, number]', '— / min'], ['onChange', '(value) => void', '—'], ['onChangeComplete', '(value) => void', '—'], ['min / max', 'number', '0 / 100'], ['step', 'number | null', '1'], ['range', 'boolean', 'false'], ['marks', 'Record<number, ReactNode | { label, style }>', '—'], ['tooltip', "'auto' | 'always' | 'none'", "'auto'"], ['tooltipFormatter', '(value) => ReactNode', '—'], ['vertical', 'boolean', 'false'], ['showValue', 'boolean', 'false'], ['included', 'boolean', 'true'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['disabled', 'boolean', 'false']],
  },
  {
    id: 'segmented', title: 'Segmented 分段控制器', icon: '◧', group: '数据录入', badge: 'Segmented', description: '在少量互斥选项间切换，带平滑滑动的指示块与方向键导航。',
    examples: [
      { title: '基础用法', description: '受控切换、图标、尺寸、圆角与通栏布局。', preview: <BasicSegmented />, code: `import { useState } from 'react';
import { Segmented } from 'atelier-ui/segmented';

export function ViewSwitch() {
  const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');
  return (
    <>
      <Segmented options={[{ label: '列表', value: 'list' }, { label: '看板', value: 'board' }, { label: '日历', value: 'calendar' }]} value={view} onChange={setView} />
      <Segmented options={[{ label: '周', value: 'week', icon: '▤' }, { label: '月', value: 'month', icon: '▦' }]} defaultValue="month" size="sm" shape="round" />
      <Segmented options={['全部', '进行中', '已完成']} block size="lg" />
    </>
  );
}` },
    ],
    rows: [['options', 'Array<string | { label, value, icon?, disabled? }>', 'required'], ['value / defaultValue', 'string', '— / 首个可用项'], ['onChange', '(value) => void', '—'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['block', 'boolean', 'false'], ['vertical', 'boolean', 'false'], ['shape', "'default' | 'round'", "'default'"], ['disabled', 'boolean', 'false'], ['label', 'string', "'视图切换'"]],
  },
  {
    id: 'timePicker', title: 'TimePicker 时间选择', icon: '◷', group: '数据录入', badge: 'TimePicker', description: '通过时 / 分 / 秒滚动列选择时间，支持步长、禁用区间与“此刻”快捷操作。',
    examples: [
      { title: '基础用法', description: '受控值、秒级精度、分钟步长与范围限制。', preview: <BasicTimePicker />, code: `import { useState } from 'react';
import { TimePicker } from 'atelier-ui/time-picker';

export function MeetingTime() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <>
      <TimePicker label="会议时间" value={time} onChange={setTime} minTime="09:00" maxTime="18:00" />
      <TimePicker label="精确到秒" format="HH:mm:ss" defaultValue="08:15:30" secondStep={15} />
      <TimePicker label="15 分钟间隔" minuteStep={15} showNow={false} />
    </>
  );
}` },
    ],
    rows: [['value / defaultValue', 'string | null', '— / null'], ['onChange', '(value: string | null, parts) => void', '—'], ['format', "'HH:mm' | 'HH:mm:ss'", "'HH:mm'"], ['hourStep / minuteStep / secondStep', 'number', '1'], ['minTime / maxTime', "string ('HH:mm')", '—'], ['disabledHours / disabledMinutes / disabledSeconds', '() => number[] 等', '—'], ['showNow', 'boolean', 'true'], ['allowClear', 'boolean', 'true'], ['placeholder', 'string', "'选择时间'"], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['open / onOpenChange', 'boolean / (open) => void', '—'], ['popupClassName / popupStyle', 'string / CSSProperties', '—']],
  },
  {
    id: 'colorPicker', title: 'ColorPicker 颜色选择器', icon: '◉', group: '数据录入', badge: 'ColorPicker', description: '自绘的 HSV 取色面板，支持透明度、多种格式、预设色板与手动输入。',
    examples: [
      { title: '基础用法', description: '受控颜色、透明度通道、不同输出格式与仅色块模式。', preview: <BasicColorPicker />, code: `import { useState } from 'react';
import { ColorPicker } from 'atelier-ui/color-picker';

export function BrandColor() {
  const [color, setColor] = useState('#685cf6');
  return (
    <>
      <ColorPicker label="品牌主色" value={color} onChange={setColor} presets={['#685cf6', '#2f9472', '#c98a29', '#d94d64']} />
      <ColorPicker label="带透明度 · RGB" defaultValue="#2f947299" showAlpha format="rgb" />
      <ColorPicker label="仅色块" defaultValue="#c98a29" showText={false} />
    </>
  );
}` },
    ],
    rows: [['value / defaultValue', 'string', "— / '#685cf6'"], ['onChange', '(hex, color: ColorValue) => void', '—'], ['onChangeComplete', '(hex, color) => void', '—'], ['format', "'hex' | 'rgb' | 'hsl'", "'hex'"], ['showAlpha', 'boolean', 'false'], ['showText', 'boolean', 'true'], ['presets', 'string[] | Array<{ label, colors }>', '—'], ['allowClear', 'boolean', 'false'], ['disabled', 'boolean', 'false'], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['label / hint / error', 'string', '—'], ['open / onOpenChange', 'boolean / (open) => void', '—'], ['popupClassName / popupStyle', 'string / CSSProperties', '—']],
  },
  {
    id: 'mentions', title: 'Mentions 提及', icon: '@', group: '数据录入', badge: 'Mentions', description: '在多行文本中输入触发符后弹出候选成员，弹层跟随光标位置。',
    examples: [
      { title: '基础用法', description: '自动高度、多触发符与自定义过滤。', preview: <BasicMentions />, code: `import { useState } from 'react';
import { Mentions } from 'atelier-ui/mentions';

const members = [
  { value: '林知夏', description: 'lin@atelier.design · 设计' },
  { value: '陈一川', description: 'chen@atelier.design · 前端' },
];

export function TeamNote() {
  const [text, setText] = useState('@林知夏 请确认设计稿');
  return (
    <>
      <Mentions label="项目留言" options={members} value={text} onChange={setText} autoSize={{ minRows: 3, maxRows: 6 }} />
      <Mentions label="多种触发符" options={['林知夏', '陈一川']} prefix={['@', '#']} rows={2} />
    </>
  );
}` },
    ],
    rows: [['options', 'Array<string | MentionOption>', 'required'], ['value / defaultValue', 'string', "— / ''"], ['onChange', '(value: string) => void', '—'], ['onSelect', '(option, prefix) => void', '—'], ['onSearch', '(query, prefix) => void', '—'], ['prefix', 'string | string[]', "'@'"], ['split', 'string', "' '"], ['filterOption', 'boolean | (query, option) => boolean', 'true'], ['autoSize', 'boolean | { minRows, maxRows }', 'false'], ['rows', 'number', '3'], ['notFoundContent', 'ReactNode', "'没有匹配的成员'"], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['popupClassName / popupStyle', 'string / CSSProperties', '—'], ['optionRender', '(option, { active, query }) => ReactNode', '—']],
  },
  {
    id: 'cascader', title: 'Cascader 级联选择', icon: '⋯', group: '数据录入', badge: 'Cascader', description: '多列级联面板按层级选择路径，支持悬停展开、任意层级选择与路径搜索。',
    examples: [
      { title: '基础用法', description: '受控路径、悬停展开 + 搜索、任意层级选择与禁用。', preview: <BasicCascader />, code: `import { useState } from 'react';
import { Cascader } from 'atelier-ui/cascader';

const regions = [
  { label: '中国', value: 'cn', children: [
    { label: '上海', value: 'sh', children: [{ label: '徐汇区', value: 'xuhui' }, { label: '浦东新区', value: 'pudong' }] },
    { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xihu' }] },
  ] },
];

export function RegionPicker() {
  const [path, setPath] = useState<string[]>(['cn', 'sh', 'xuhui']);
  return (
    <>
      <Cascader label="所在地区" options={regions} value={path} onChange={setPath} />
      <Cascader label="悬停展开 + 搜索" options={regions} expandTrigger="hover" showSearch />
      <Cascader label="允许选择任意一级" options={regions} changeOnSelect displayRender={(labels) => labels.join(' › ')} />
    </>
  );
}` },
    ],
    rows: [['options', 'CascaderOption[]', 'required'], ['value / defaultValue', 'string[]', '— / []'], ['onChange', '(path, selectedOptions) => void', '—'], ['expandTrigger', "'click' | 'hover'", "'click'"], ['changeOnSelect', 'boolean', 'false'], ['showSearch', 'boolean', 'false'], ['displayRender', '(labels, selectedOptions) => ReactNode', "labels.join(' / ')"], ['allowClear', 'boolean', 'true'], ['notFoundContent', 'ReactNode', "'暂无匹配选项'"], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['disabled', 'boolean', 'false'], ['open / onOpenChange', 'boolean / (open) => void', '—'], ['popupClassName / popupStyle', 'string / CSSProperties', '—']],
  },
  {
    id: 'treeSelect', title: 'TreeSelect 树选择', icon: '⌥', group: '数据录入', badge: 'TreeSelect', description: '以树形面板从层级数据中选择，支持搜索、单选 / 多选与级联勾选。',
    examples: [
      { title: '基础用法', description: '单选搜索、可勾选多选、默认展开与禁用。', preview: <BasicTreeSelect />, code: `import { useState } from 'react';
import { TreeSelect } from 'atelier-ui/tree-select';

const teams = [
  { label: '设计部', value: 'design', children: [{ label: '品牌组', value: 'brand' }, { label: '体验组', value: 'ux' }] },
  { label: '工程部', value: 'engineering', children: [
    { label: '前端组', value: 'frontend', children: [{ label: 'Web 小组', value: 'web' }] },
    { label: '后端组', value: 'backend' },
  ] },
];

export function TeamSelect() {
  const [team, setTeam] = useState('web');
  const [checked, setChecked] = useState<string[]>(['ux']);
  return (
    <>
      <TreeSelect label="所属团队" treeData={teams} value={team} onChange={(value) => setTeam(value as string)} showSearch />
      <TreeSelect label="多选可勾选" treeData={teams} treeCheckable value={checked} onChange={(value) => setChecked(value as string[])} treeDefaultExpandAll />
    </>
  );
}` },
    ],
    rows: [['treeData', 'TreeSelectNode[]', 'required'], ['value / defaultValue', 'string | string[]', '—'], ['onChange', '(value, nodes) => void', '—'], ['multiple', 'boolean', 'false'], ['treeCheckable', 'boolean', 'false'], ['showSearch', 'boolean', 'false'], ['treeDefaultExpandAll', 'boolean', 'false'], ['treeDefaultExpandedKeys', 'string[]', '—'], ['maxTagCount', 'number', '—'], ['allowClear', 'boolean', 'true'], ['notFoundContent', 'ReactNode', "'暂无匹配选项'"], ['size', "'sm' | 'md' | 'lg'", "'md'"], ['status', "'error' | 'warning'", '—'], ['label / hint / error', 'string', '—'], ['disabled', 'boolean', 'false'], ['popupClassName / popupStyle', 'string / CSSProperties', '—'], ['popupMatchSelectWidth', 'boolean', 'true']],
  },
  {
    id: 'transfer', title: 'Transfer 穿梭框', icon: '⇄', group: '数据录入', badge: 'Transfer', description: '在两个列表间批量移动条目，支持全选、搜索、单向模式与自定义渲染。',
    examples: [
      { title: '基础用法', description: '受控目标列表、搜索、单向移除与自定义条目 / 页脚。', preview: <BasicTransfer />, code: `import { useState } from 'react';
import { Transfer } from 'atelier-ui/transfer';

const members = [
  { key: 'lin', title: '林知夏', description: '设计' },
  { key: 'chen', title: '陈一川', description: '前端' },
  { key: 'zhou', title: '周禾', description: '产品' },
  { key: 'guest', title: '访客账号', disabled: true },
];

export function MemberTransfer() {
  const [targets, setTargets] = useState<string[]>(['lin']);
  return (
    <>
      <Transfer dataSource={members} targetKeys={targets} onChange={(keys) => setTargets(keys)} titles={['可选成员', '项目成员']} />
      <Transfer
        dataSource={members}
        defaultTargetKeys={['chen']}
        showSearch
        oneWay
        render={(item) => <span>{item.title} · {item.description}</span>}
        footer={(direction, info) => \`\${direction === 'left' ? '可选' : '已选'} \${info.total} 人\`}
      />
    </>
  );
}` },
    ],
    rows: [['dataSource', 'TransferItem[]', 'required'], ['targetKeys / defaultTargetKeys', 'string[]', '— / []'], ['onChange', '(targetKeys, direction, moveKeys) => void', '—'], ['selectedKeys / onSelectChange', 'string[] / (source, target) => void', '—'], ['titles', '[ReactNode, ReactNode]', "['可选项目', '已选项目']"], ['operations', '[string, string]', "['移至已选', '移回可选']"], ['showSearch', 'boolean', 'false'], ['filterOption', '(query, item) => boolean', '按标题包含'], ['render', '(item) => ReactNode', 'item.title'], ['footer', '(direction, { total, selected }) => ReactNode', '—'], ['showSelectAll', 'boolean', 'true'], ['oneWay', 'boolean', 'false'], ['disabled', 'boolean', 'false'], ['listStyle', 'CSSProperties', '—'], ['notFoundContent', 'ReactNode', "'暂无数据'"]],
  },
];

export function isDataEntryPageId(id: string): id is DataEntryPageId {
  return dataEntryPages.some((item) => item.id === id);
}

export function DataEntryPage({ id }: { id: DataEntryPageId }) {
  const { t: dt } = useDemoLocale();
  const localizedDataEntryPages = translateDemoValue(dataEntryPages, dt);

  const page = localizedDataEntryPages.find((item) => item.id === id);
  if (!page) return null;
  return <>
    <PageHeading eyebrow="DATA ENTRY" title={page.title} description={page.description} badge={page.badge} />
    {page.examples.map((example) => <ExampleCard key={example.title} title={example.title} description={example.description} code={example.code}>{example.preview}</ExampleCard>)}
    <ApiTable rows={page.rows} />
  </>;
}
