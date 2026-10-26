import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FileUpload(id: string, description: string) {
    return (
        <Field>
            <FieldLabel htmlFor="CV">
                {id} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input id={id} type="file" required />
            <FieldDescription>{description}</FieldDescription>
        </Field>
    );
}
