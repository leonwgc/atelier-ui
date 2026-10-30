import { useDemoLocale } from './locale';
import { useState } from 'react';
import { ConfigProvider } from '../src/ConfigProvider';
import { createLocale, enUS, useLocale } from '../src/locale';
import { Button } from '../src/Button';
import { Empty } from '../src/Empty';
import { Select } from '../src/Select';
import { Pagination } from '../src/Pagination';
import { Calendar } from '../src/Calendar';
import { Upload } from '../src/Upload';
import { useModal } from '../src/Modal';
import { useMessage } from '../src/Message';
import { useNotification } from '../src/Notification';
import { Input } from '../src/Input';
import { useForm } from '../src/form';

const japanese = createLocale('ja-JP', {
  'common.noData': 'データがありません',
  'common.select': '選択してください…',
  'common.ok': '確認',
  'common.cancel': 'キャンセル',
}, enUS);

function LocalizedControls() {
  const { locale } = useLocale();
  const modal = useModal();
  const message = useMessage();
  const notification = useNotification();
  const form = useForm({ defaultValues: { name: '' } });
  const [page, setPage] = useState(1);
  return <div className="config-locale-demo">
    <div className="component-row">
      <Select options={[]} searchable allowClear aria-label={locale === 'zh-CN' ? '演示选项' : 'Demo options'} />
      <Button onClick={() => modal.confirm({ title: locale === 'zh-CN' ? '确认操作' : 'Confirm action' })}>Modal.confirm</Button>
      <Button onClick={() => message.success('Success')}>Message</Button>
      <Button onClick={() => notification.success({ title: 'Success' })}>Notification</Button>
    </div>
    <Pagination current={page} pageSize={10} total={45} showSizeChanger onChange={setPage} />
    <Empty />
    <Upload />
    <Calendar fullscreen={false} />
    <form onSubmit={form.handleSubmit(() => undefined)} className="component-row" noValidate>
      <Input aria-label="Name" {...form.register('name', { required: true })} error={form.formState.errors.name?.message} />
      <Button type="submit">Validate</Button>
    </form>
    <ConfigProvider messages={{ 'common.noData': locale === 'zh-CN' ? '此区域暂时没有内容' : 'No content in this section' }}>
      <Empty />
    </ConfigProvider>
  </div>;
}

export default function ConfigProviderDemo() {
  const { locale: siteLocale, t: dt } = useDemoLocale();
  const [override, setLocale] = useState<string>();
  const locale = override ?? siteLocale;
  return <div className="config-locale-demo">
    <label>{dt('组件语言 / Component language')}{' '}
      <select aria-label={dt('组件语言 / Component language')} value={locale} onChange={(event) => setLocale(event.target.value)}>
        <option value="zh-CN">简体中文</option><option value="en-US">English</option><option value="ja-JP">日本語 · Custom pack</option>
      </select>
    </label>
    <ConfigProvider locale={locale} locales={{ 'ja-JP': japanese }}>
      <LocalizedControls />
    </ConfigProvider>
  </div>;
}
