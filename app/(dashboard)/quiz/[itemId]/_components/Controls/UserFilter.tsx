"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFilterProps {
  value: string;
  onChange: (value: string) => void;
  users: {
    id: string;
    name: string;
    email: string;
  }[];
}

const UserFilter = ({ value, onChange, users }: UserFilterProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="user-filter">Student</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="user-filter">
          <SelectValue placeholder="Select student" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Students</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFilter;
