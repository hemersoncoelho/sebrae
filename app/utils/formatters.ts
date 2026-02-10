export const parseDate = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();

    // Try parsing as ISO first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }

    // Try parsing as DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    }

    // Fallback to current date or handle error
    console.warn("Could not parse date:", dateString);
    return new Date().toISOString();
};
