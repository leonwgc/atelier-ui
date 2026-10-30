import { useDemoLocale } from '../locale';
import { Button } from '../../src/entries/button';
import { Input } from '../../src/entries/input';
import { Transition } from '../../src/entries/transition';
import { TransitionGroup } from '../../src/entries/transition-group';
import { useFieldArray, useForm } from '../../src/entries/form';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const form = useForm<{ members: Array<{ name: string }> }>({
    defaultValues: { members: [{ name: 'Alex Chen' }] },
  });
  const members = useFieldArray<{ members: Array<{ name: string }> }, { name: string }>({
    control: form.control, name: 'members',
  });

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button onClick={() => members.append({ name: dt("成员 {0}", { 0: members.fields.length + 1 }) })}>{dt("添加成员")}</Button>
        <span className="animation-demo__hint" aria-live="polite">
          {dt("当前")}{members.fields.length} {dt("位成员，增删时观察滑入和退出动画")}</span>
      </div>
      <TransitionGroup className="animation-demo__list">
        {members.fields.map((member, index) => (
          <Transition key={member.id} animation="slide-up" timeout={450}
            exit={<div className="animation-demo__exit">{member.name || dt("未命名成员")} {dt("已移除")}</div>}>
            <div className="animation-demo__row">
              <Input aria-label={dt("成员 {0} 姓名", { 0: index + 1 })} {...form.register(`members.${index}.name`)} />
              <Button variant="tertiary" size="sm" aria-label={dt("移除成员 {0}", { 0: index + 1 })} onClick={() => members.remove(index)}>{dt("移除")}</Button>
            </div>
          </Transition>
        ))}
      </TransitionGroup>
    </div>
  );
}
