export default function rulesHandler({
    rules = [
        (value) => {
            if (value.length < 8) {
                return {
                    type: 'error',
                    message: 'Password must be at least 8 characters',
                }
            }
            return true;
        }
    ],
    value } = {}
) {
    return rules.map((rule) => rule(value));
}
