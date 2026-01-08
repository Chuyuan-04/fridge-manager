import React from "react";
import { Plus, Minus, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { getDaysLeft, getStatusColor } from "../utils/dateUtils";

function calcExpiresAt(purchaseDate, shelfLife) {
  if (!purchaseDate || typeof shelfLife !== "number") return "";
  const d = new Date(purchaseDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + shelfLife);
  return d.toISOString().split("T")[0];
}

function IngredientCard({ item, onUpdateAmount }) {
  const name = item?.name ?? "";
  const unit = item?.unit ?? "个";
  const storage = item?.storage ?? "fridge";
  const amount = Number(item?.amount ?? 0);
  const shelfLife = Number(item?.shelfLife ?? 0);
  const purchaseDate = item?.purchaseDate ?? "";

  const daysLeft = getDaysLeft(purchaseDate, shelfLife, storage);
  const statusColor = getStatusColor(daysLeft, storage);

  const expiresAt =
    item?._expiresAt || calcExpiresAt(purchaseDate, shelfLife);

  const getStorageIcon = (s) => {
    if (s === "freezer") return "❄️";
    if (s === "fridge") return "🧊";
    if (s === "room") return "📦";
    return "📦";
  };

  const getDaysText = (days, s) => {
    if (s === "freezer") return "冷冻保存";
    if (days > 0) return `剩余 ${days} 天`;
    if (days === 0) return "今天到期";
    return "已过期";
  };

  // ✅ draggable id：必须唯一到“批次”
  const dragId = `${name}__${storage}__${unit}__${expiresAt}`;

  const { attributes, listeners, setNodeRef, transform, isDragging, setActivatorNodeRef } =
    useDraggable({
      id: dragId,
      data: {
        name,
        unit,
        fromStorage: storage,
        amount, // 聚合后的数量
        expiresAt, // ✅ 关键：用到期日作为批次标识
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 9999 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border-2 ${statusColor} select-none`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="w-10 h-10 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center cursor-grab active:cursor-grabbing"
            title="拖拽移动"
            type="button"
          >
            <GripVertical size={18} />
          </button>

          <div className="text-xl">{getStorageIcon(storage)}</div>

          <div className="min-w-0">
            <div className="font-semibold truncate">{name || "（未命名）"}</div>
            <div className="text-sm opacity-75">
              {getDaysText(daysLeft, storage)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="font-bold text-lg">{amount}</div>
            <div className="text-xs opacity-70">{unit}</div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onUpdateAmount(item, 1)}
              className="w-10 h-10 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center transition"
              type="button"
              title="补充"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => onUpdateAmount(item, -1)}
              className="w-10 h-10 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center transition"
              type="button"
              title="用了"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientCard;
