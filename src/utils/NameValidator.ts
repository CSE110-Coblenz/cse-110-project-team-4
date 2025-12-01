const MAX_NAME_LENGTH = 50;

export function sanitize(name: string): string {
    name = name.trim();
    if (name.length > MAX_NAME_LENGTH) {
        name = name.substring(0, MAX_NAME_LENGTH);
    }
    name = name.normalize("NFC");
    name = name.replace(/<[^>]*>?/gm, "");

    return name
}