/**
 * 弹窗配置
 *
 * 每个弹窗对象包含以下字段：
 *
 * id       - 弹窗唯一标识，用于 sessionStorage 记录"已关闭"状态，
 *            同一会话内关闭后不再弹出
 * title    - 弹窗标题，显示在弹窗顶部
 * source   - 内容来源文件路径（@ 格式），与 content 二选一，优先读取文件
 *            例："@/content/spec/notice.dj"
 * content  - 弹窗正文内容（支持 HTML），source 不存在时使用
 * order    - 显示顺序，数值越小越先弹出
 * pos      - 弹窗位置，可选值：
 *            "top-right" | "top-center" | "top-left" |
 *            "bottom-right" | "bottom-center" | "bottom-left"
 * col      - 是否可折叠，内容过长时显示展开/收起按钮
 * maxH     - 折叠时最大高度（如 "8rem"），仅 col 为 true 时生效
 * time     - 自动关闭时间（秒），0 或不设置则不自动关闭，默认 10 秒
 */

export interface PopupItem {
    id: string;
    title: string;
    source?: string;
    content?: string;
    order: number;
    pos: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
    col: boolean;
    maxH: string;
    time?: number;
}

export const popups: PopupItem[] = [
    {
        id: "notice",
        title: "公告",
        source: "@/content/spec/notice.dj",
        order: 1,
        pos: "top-right",
        col: false,
        maxH: "8rem",
        time: 10,
    },
];
