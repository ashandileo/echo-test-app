"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="status-filter">Status</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="status-filter">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="not_started">Not Started</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="submitted">Submitted (Needs Grading)</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
