"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const groupByKey = (arr, key) => {
    return arr.reduce((acc, current) => {
        acc[current[key]] = acc[current[key]] || [];
        acc[current[key]].push(current);
        return acc;
    }, Object.create(null));
};
exports.default = groupByKey;
