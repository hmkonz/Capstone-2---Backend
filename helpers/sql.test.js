const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    // this function takes the 2nd parameter and sets it to setCols, a key equal to its index number with a $ and assigns the first parameter as its value. 
    // Since there's only one element in the first parameter, only the first element of the 2nd parameter object is assigned to setCols
    const result = sqlForPartialUpdate(
        { f1: "v1" },
        { f1: "f1", fF2: "f2" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1",
      values: ["v1"],
    });
  });

  test("works: 2 items", function () {
    // this function takes the 2nd parameter and sets it to setCols, a key equal to its index number with a $ and assigns the 2nd element in the first parameter as its value. 
    // Since the test above already added "\"f1\"=$1" to setCols as a key, this test adds a this newly created key (\"f2\"=$2") to setCols so now it equals both column names (keys)
    // Since the test above already added "v1" to the values array, this test adds a newly created value ("v2") to the values array so now the array holds both values. 
    const result = sqlForPartialUpdate(
        { f1: "v1", jsF2: "v2" },
        { jsF2: "f2" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1, \"f2\"=$2",
      values: ["v1", "v2"],
    });
  });
});