export const formatValidationError = (error: Error) => {
    const errors: { [field: string]: string } = {};

    Object.keys((error as any).errors).forEach((key) => {
        errors[key] = (error as any).errors[key].message;
    });

    return { errors };
};
