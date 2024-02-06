export const pagination = (pageNumber: number = 1, pageSize: number = 10) => {
  console.log(pageNumber, pageSize);
  const offset = (pageNumber - 1) * pageSize;
  const pagiQuery = `OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
  return pagiQuery;
};
