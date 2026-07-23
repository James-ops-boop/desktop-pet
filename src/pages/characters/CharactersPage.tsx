import { ComingSoonPanel } from "../../components/settings/SettingsControls";

const CHARACTER_ITEMS = [
  "职业分类",
  "角色卡片网格",
  "大型角色预览",
  "角色信息",
  "模式预览",
  "确认设为当前桌宠",
] as const;

export function CharactersPage() {
  return (
    <div className="settings-page">
      <ComingSoonPanel
        phase="PHASE 3"
        title="可扩展角色选择"
        description="下一阶段将建立角色注册表和浏览 / 启用分离流程。当前不会创建假角色数据，也不会分发官方角色原画。"
        items={CHARACTER_ITEMS}
      />
    </div>
  );
}
