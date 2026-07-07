import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from 'basketball';

export function PositionMenu() {
  return (
    <div className="w-64">
      <Select defaultValue="sf" defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Select position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pg">Point Guard</SelectItem>
          <SelectItem value="sg">Shooting Guard</SelectItem>
          <SelectItem value="sf">Small Forward</SelectItem>
          <SelectItem value="pf">Power Forward</SelectItem>
          <SelectItem value="c">Center</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
