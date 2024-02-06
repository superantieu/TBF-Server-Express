const groupByKey = <T>(arr: T[], key: keyof T) => {
    return arr.reduce((acc, current) => {
        acc[current[key]] = acc[current[key]] || [];
        acc[current[key]].push(current);
        return acc;
    }, Object.create(null));
};
export default groupByKey;
