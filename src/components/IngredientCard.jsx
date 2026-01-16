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

function IngredientCard({ item, onUpdateAmount, isOverlay = false }) {
  const name = item?.name ?? "";
  const unit = item?.unit ?? "个";
  const storageRaw = item?.storage ?? "fridge";
  const storage = storageRaw === "room" ? "pantry" : storageRaw;
  const amount = Number(item?.amount ?? 0);
  const shelfLife = Number(item?.shelfLife ?? 0);
  const purchaseDate = item?.purchaseDate ?? "";

  const daysLeft = getDaysLeft(purchaseDate, shelfLife, storage);
  const statusColor = getStatusColor(daysLeft, storage);

  const expiresAt = item?._expiresAt || calcExpiresAt(purchaseDate, shelfLife);

  const getStorageIcon = (s) => {
    if (s === "freezer") return "❄️";
    if (s === "fridge") return "🧊";
    if (s === "pantry") return "🏠";
    if (s === "condiment") return "🧂";
    return "📦";
  };

  const getDaysText = (days, s) => {
    if (s === "freezer") return "冷冻保存";
    if (days > 0) return `剩余 ${days} 天`;
    if (days === 0) return "今天到期";
    return "已过期";
  };

  const dragId = `${name}__${storage}__${unit}__${expiresAt}`;

  const draggable = !isOverlay
    ? useDraggable({
        id: dragId,
        data: {
          name,
          unit,
          fromStorage: storage,
          amount,
          expiresAt,
        },
      })
    : null;

  const attributes = draggable?.attributes;
  const listeners = draggable?.listeners;
  const setNodeRef = draggable?.setNodeRef;
  const transform = draggable?.transform;
  const isDragging = draggable?.isDragging;
  const setActivatorNodeRef = draggable?.setActivatorNodeRef;

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
      className={[
        "px-2.5 py-2 rounded-xl border-2 select-none",
        statusColor,
        isOverlay ? "shadow-2xl" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className={[
            "w-7 h-7 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center",
            isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
          ].join(" ")}
          title="拖拽移动"
          type="button"
          disabled={isOverlay}
        >
          <GripVertical size={14} />
        </button>

        <div className="text-base leading-none">{getStorageIcon(storage)}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold truncate">
              {name || "（未命名）"}
            </div>

            <div className="text-sm font-black whitespace-nowrap">
              {amount}
              <span className="text-[11px] font-semibold opacity-70 ml-1">
                {unit}
              </span>
            </div>
          </div>

          <div className="text-[11px] opacity-75 truncate">
            {getDaysText(daysLeft, storage)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateAmount?.(item, 1)}
            className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center"
            type="button"
            title="补充"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onUpdateAmount?.(item, -1)}
            className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center"
            type="button"
            title="用了"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientCard;
