"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = void 0;
const pagination = (pageNumber = 1, pageSize = 10) => {
    console.log(pageNumber, pageSize);
    const offset = (pageNumber - 1) * pageSize;
    const pagiQuery = `OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    return pagiQuery;
};
exports.pagination = pagination;
