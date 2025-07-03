import React from "react";
import type { LogicNode } from "@/types/strategy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LogicOperatorBuilderProps {
  value: LogicNode;
  onChange: (node: LogicNode) => void;
  depth?: number;
}

const operatorOptions = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "==", label: "==" },
  { value: "!=", label: "!=" },
];

function renderConditionFields(node: Extract<LogicNode, { type: "CONDITION" }>, onChange: (n: LogicNode) => void) {
  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-24"
        value={node.left}
        onChange={e => onChange({ ...node, left: e.target.value })}
        placeholder="Left"
      />
      <Select
        value={node.operator}
        onValueChange={op => onChange({ ...node, operator: op })}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="w-24"
        value={String(node.right)}
        onChange={e => onChange({ ...node, right: e.target.value })}
        placeholder="Right"
      />
    </div>
  );
}

export default function LogicOperatorBuilder({ value, onChange, depth = 0 }: LogicOperatorBuilderProps) {
  // Helper to add a new condition
  const addCondition = () => {
    if (value.type === "AND" || value.type === "OR") {
      onChange({
        ...value,
        children: [
          ...value.children,
          { type: "CONDITION", left: "", operator: "==", right: "" },
        ],
      });
    }
  };
  // Helper to add a new group
  const addGroup = (groupType: "AND" | "OR") => {
    if (value.type === "AND" || value.type === "OR") {
      onChange({
        ...value,
        children: [
          ...value.children,
          { type: groupType, children: [] },
        ],
      });
    }
  };
  // Helper to remove a child
  const removeChild = (idx: number) => {
    if (value.type === "AND" || value.type === "OR") {
      onChange({
        ...value,
        children: value.children.filter((_, i) => i !== idx),
      });
    }
  };
  // Helper to update a child
  const updateChild = (idx: number, node: LogicNode) => {
    if (value.type === "AND" || value.type === "OR") {
      const newChildren = value.children.slice();
      newChildren[idx] = node;
      onChange({ ...value, children: newChildren });
    }
  };
  // Helper to change group type
  const changeGroupType = (type: "AND" | "OR") => {
    if (value.type === "AND" || value.type === "OR") {
      onChange({ ...value, type });
    }
  };

  if (value.type === "CONDITION") {
    return renderConditionFields(value, onChange);
  }

  // value.type === "AND" | "OR"
  return (
    <div className="border rounded p-2 mb-2" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 mb-2">
        <Select value={value.type} onValueChange={changeGroupType}>
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={addCondition}>+ Condition</Button>
        <Button size="sm" variant="outline" onClick={() => addGroup("AND")}>+ AND Group</Button>
        <Button size="sm" variant="outline" onClick={() => addGroup("OR")}>+ OR Group</Button>
      </div>
      <div className="space-y-2">
        {value.children.map((child, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <LogicOperatorBuilder
              value={child}
              onChange={node => updateChild(idx, node)}
              depth={depth + 1}
            />
            <Button size="sm" variant="destructive" onClick={() => removeChild(idx)}>-</Button>
          </div>
        ))}
        {value.children.length === 0 && (
          <div className="text-xs text-muted-foreground">No conditions/groups. Add one above.</div>
        )}
      </div>
    </div>
  );
} 