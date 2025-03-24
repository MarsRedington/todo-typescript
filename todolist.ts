type Todo = {
    id: number;
    text: string;
    completed: boolean;
  };
  
  const createTodoList = (): [] => [];
  
  const maxId = <List extends Todo[]>(list: List): number => {
    if (list.length === 0) return 1;
    return Math.max(...list.map((t) => t.id)) + 1;
  };
  
  type BuildTupe<L extends number, Arr extends unknown[] = [], > = L extends Arr["length"] ? Arr : BuildTupe<L, [...Arr, unknown]>;
  
  type GreaterOrEqual<A extends number, B extends number> = BuildTupe<A> extends [
    ...BuildTupe<B>,
    ...infer Rest,
  ]
    ? true
    : false;
  
  type R = GreaterOrEqual<3, 5>;
  
  type Add<A extends number, B extends number> = [
    ...BuildTupe<A>,
    ...BuildTupe<B>,
  ]["length"];
  
  type GenId<List extends Todo[], Max extends number = 0> = List extends [
    infer First extends Todo,
    ...infer Rest extends Todo[],
  ]
    ? GreaterOrEqual<First["id"] & number, Max> extends true
      ? GenId<Rest, First["id"]>
      : GenId<Rest, Max>
    : Add<Max, 1>;
  
  type R3 = GenId<
    [
      { id: 4; text: "1"; completed: false },
      { id: 2; text: "1"; completed: false },
    ]
  >;
  
  type AppTodoItem<List extends Todo[], Text extends string> = [
    ...List,
    {
      id: GenId<List>;
      text: Text;
      completed: false;
    },
  ];
  
  // main 
  const addTodoItem = <List extends Todo[], Text extends string>(
    list: List,
    text: Text,
  ): AppTodoItem<List, Text> => [
    ...list,
    { id: maxId(list) as unknown as GenId<List>, text, completed: false },
  ];
  
  type RemoveTodoItem<
    List extends Todo[],
    Id extends number,
    Acc extends Todo[] = [],
  > = List extends [infer First extends Todo, ...infer Rest extends Todo[]]
    ? First["id"] extends Id
      ? [...Acc, ...Rest]
      : RemoveTodoItem<Rest, Id, [...Acc, First]>
    : Acc;
  
  const removeTodoItem = <List extends Todo[], Id extends List[number]["id"]>(
    list: List,
    id: Id,
  ): RemoveTodoItem<List, Id> =>
    list.filter((todo) => todo.id !== id) as unknown as RemoveTodoItem<List, Id>;
  
  type FindTodoItemById<
    List extends Todo[],
    Id extends List[number]["id"],
    TodoUnion extends Todo = List[number],
  > = TodoUnion extends { id: Id } ? TodoUnion : never;
  
  const findById = <List extends Todo[], Id extends List[number]["id"]>(
    list: List,
    id: Id,
  ): FindTodoItemById<List, Id> =>
    list.find((todo) => todo.id === id) as FindTodoItemById<List, Id>;
  
  type FilterTodoItem<List extends Todo[], Criteria extends Partial<Todo>, Acc extends Todo[] = [], > = List extends [infer First extends Todo, ...infer Rest extends Todo[]]
    ? First extends Criteria
      ? FilterTodoItem<Rest, Criteria, [...Acc, First]>
      : FilterTodoItem<Rest, Criteria, [...Acc]>
    : Acc;
  
  // Filter
  const filterBy = <List extends Todo[], const Criteria extends Partial<Todo>>(
    list: List,
    criteria: Criteria,
  ): FilterTodoItem<List, Criteria> =>
    list.filter((todo) =>
      Object.keys(criteria).every(
        (key) => todo[key as keyof Todo] === criteria[key as keyof Todo],
      ),
    ) as unknown as FilterTodoItem<List, Criteria>;
  
  type UpdateTodoItem<List extends Todo[], Id extends number, Update extends Partial<Omit<Todo, "id">>, > = {
    [Index in keyof List]: List[Index] extends { id: Id }
      ? {
          [Key in keyof List[Index]]: Key extends keyof Update
            ? Update[Key]
            : List[Index][Key];
        }
      : List[Index];
  };
  
  // Update
  const updateTodoItem = <List extends Todo[], Id extends number, const Update extends Partial<Omit<Todo, "id">>,>(
    list: List,
    id: Id,
    update: Update,
  ): UpdateTodoItem<List, Id, Update> =>
    list.map((todo) =>
      todo.id === id ? { ...todo, ...update } : todo,
    ) as UpdateTodoItem<List, Id, Update>;
  
  type Not<T> = T extends true ? false : true
  
  const toggleTodoItem = <List extends Todo[], Id extends number>(list: List,id: Id,) =>
    list.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ) as unknown as UpdateTodoItem<
      List,
      Id,
      { completed: Not<FindTodoItemById<List, Id>["completed"]> }
    >;
  
  // An example of use
  const todos = createTodoList();
  const todos2 = addTodoItem(todos, "Learn TypeScript");
  const todos3 = addTodoItem(todos2, "Build Todo App");
  const todos4 = addTodoItem(todos3, "Make types stronger");
  const todos5 = removeTodoItem(todos4, 2);
  const foundTodo = findById(todos5, 1);
  const filter = filterBy(todos4, { text: "Make types stronger" });
  const todos6 = toggleTodoItem(todos4, 1);
  const todos7 = updateTodoItem(todos4, 2, { text: "Build Todo App with TS" });
  
  console.log("All Todos:", todos);
  console.log("Active Todos:", filterBy(todos, { completed: false }));