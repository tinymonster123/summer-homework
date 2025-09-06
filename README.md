### 一、题目的要求

**【任务】** 实现一个飞机订票系统。

**【功能要求】**
1.  **航班录入**: 可以录入航班信息，数据需存储在文件中。
2.  **航班查询**: 可按航班号或起飞/抵达城市查询航班的详细信息，包括时间、票价、折扣及余票情况。
3.  **订票**: 实现订票功能，订单信息需存入文件。若航班满仓，应能推荐其他可选航班。
4.  **退票**: 支持退票操作，并同步更新相关数据文件。
5.  **客户管理**: 管理客户信息（姓名、证件号等）及订单（含订单编号）。
6.  **航班修改**: 支持对已录入的航班信息进行修改。

### 二、设计过程：数据结构与算法

#### 2.1 数据结构选择与设计

为了管理航班、客户和订单这三个核心实体，我们选择了**对象数组**作为主要的数据结构。这种结构直接、易于理解，并且能与作为持久化存储的 JSON 文件格式完美映射。

所有的数据模型都在 `types/index.ts` 文件中进行了类型定义，确保了整个应用的数据一致性和类型安全。

```typescript
// types/index.ts
// 航班信息
export interface Flight {
  flightNumber: string;        // 航班号
  departureCity: string;       // 起飞城市
  arrivalCity: string;         // 到达城市
  departureTime: string;       // 起飞时间
  arrivalTime: string;         // 到达时间
  price: number;              // 票价
  discount: number;           // 折扣 (0-1)
  totalSeats: number;         // 总座位数
  availableSeats: number;     // 可用座位数
  status: 'active' | 'cancelled' | 'delayed'; // 航班状态
}

// 客户信息
export interface Customer {
  id: string;                 // 客户ID
  name: string;               // 姓名
  idCard: string;             // 证件号
  phone: string;              // 电话
  email: string;              // 邮箱
}

// 订单信息
export interface Order {
  orderId: string;            // 订单编号
  customerId: string;         // 客户ID
  flightNumber: string;       // 航班号
  passengerCount: number;     // 订票数量
  totalPrice: number;         // 总价
  orderTime: string;          // 订票时间
  status: 'confirmed' | 'cancelled' | 'refunded'; // 订单状态
  passengers: Passenger[];    // 乘客信息
}
```

#### 2.2 算法设计与复杂度分析

系统的核心功能围绕着对这些数据数组的增、删、查、改操作展开。

1.  **航班查询 (`searchFlights`)**
    *   **算法**: 采用**线性搜索**算法。通过遍历内存中的 `Flight[]` 数组（使用 `Array.prototype.filter` 方法），匹配所有满足查询条件的航班。
    *   **时间复杂度**: `O(n)`，其中 `n` 是航班的总数。
    *   **空间复杂度**: `O(k)`，其中 `k` 是查询结果的数量。

    ```typescript
    // lib/flightService.ts
    searchFlights(query: FlightQuery): Flight[] {
      const flights = this.dataManager.getFlights();
      return flights.filter(f => {
        let match = true;
        if (query.flightNumber && f.flightNumber !== query.flightNumber) {
          match = false;
        }
        if (query.departureCity && f.departureCity !== query.departureCity) {
          match = false;
        }
        if (query.arrivalCity && f.arrivalCity !== query.arrivalCity) {
          match = false;
        }
        return match && f.status === 'active';
      });
    }
    ```

2.  **订票 (`bookTicket`)**
    *   **算法**: 这是一个复合操作。首先，通过线性搜索在 `Flight[]` 中找到目标航班（`O(n)`）。然后，检查余票是否充足（`O(1)`）。如果充足，则更新该航班的座位数（`O(1)`）并向 `Order[]` 数组中添加一条新订单（`O(1)`）。
    *   **时间复杂度**: 整个操作的复杂度由查找航班的步骤决定，因此为 `O(n)`。

    ```typescript
    // lib/flightService.ts
    bookTicket(flightNumber: string, customerId: string, passengers: Passenger[]): Order {
      const flights = this.dataManager.getFlights();
      const flight = flights.find(f => f.flightNumber === flightNumber && f.status === 'active');
    
      if (!flight) {
        throw new Error('Flight not found or not active.');
      }
    
      if (flight.availableSeats < passengers.length) {
        // ... 错误处理和备选航班推荐
        throw new Error('Not enough available seats.');
      }
    
      // 更新航班座位
      flight.availableSeats -= passengers.length;
      this.dataManager.saveFlights(flights);
    
      // 创建新订单
      const newOrder: Order = { /* ... */ };
      const orders = this.dataManager.getOrders();
      orders.push(newOrder);
      this.dataManager.saveOrders(orders);
    
      return newOrder;
    }
    ```

3.  **退票 (`refundTicket`)**
    *   **算法**: 首先，根据订单ID在线性搜索 `Order[]` 数组找到对应订单（`O(m)`，`m`为订单总数）。然后，根据订单中的航班号，在线性搜索 `Flight[]` 数组找到对应航班（`O(n)`）。最后，更新订单状态和航班余票（`O(1)`）。
    *   **时间复杂度**: `O(m + n)`，因为需要分别遍历订单和航班两个数组。

    ```typescript
    // lib/flightService.ts
    refundTicket(orderId: string): boolean {
      const orders = this.dataManager.getOrders();
      const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
      if (orderIndex === -1 || orders[orderIndex].status !== 'confirmed') {
        throw new Error('Order not found or cannot be refunded.');
      }
    
      const order = orders[orderIndex];
      order.status = 'refunded';
      this.dataManager.saveOrders(orders);
    
      // 恢复航班座位
      const flights = this.dataManager.getFlights();
      const flight = flights.find(f => f.flightNumber === order.flightNumber);
      if (flight) {
        flight.availableSeats += order.passengerCount;
        this.dataManager.saveFlights(flights);
      }
    
      return true;
    }
    ```

**算法比较与优化思路**: 
当前采用的线性搜索算法简单直观，在数据量较小的情况下性能良好。但当数据量增大时，`O(n)` 的时间复杂度会导致性能下降。为了优化性能，可以引入**哈希表（`Map`）**作为索引，将查询时间复杂度优化到 `O(1)`。


### 三、实现细节

#### 3.1 文件操作

根据要求，所有数据都存储在文件中。`lib/dataManager.ts` 模块专门负责此项任务。它使用 Node.js 的 `fs` 模块：
- 在服务启动时，通过 `fs.readFileSync` 从 `.json` 文件中读取数据，并将其解析为 JavaScript 数组，加载到内存中。
- 当数据发生变更（如新增订单、修改航班）时，通过 `fs.writeFileSync` 将更新后的内存数组序列化为 JSON 字符串，并同步写回文件，确保数据的持久性。

```typescript
// lib/dataManager.ts
import fs from 'fs';
import path from 'path';

export class DataManager {
  // 航班数据操作
  getFlights(): Flight[] {
    try {
      const data = fs.readFileSync(this.flightsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取航班数据失败:', error);
      return [];
    }
  }

  saveFlights(flights: Flight[]): void {
    try {
      fs.writeFileSync(this.flightsFile, JSON.stringify(flights, null, 2));
    } catch (error) {
      console.error('保存航班数据失败:', error);
      throw new Error('保存航班数据失败');
    }
  }
}
```

#### 3.2 用户交互界面

系统提供了一个友好的图形用户界面（GUI），而非传统的命令行菜单。该界面位于 `app/page.tsx`，主要特点如下：
- **菜单式导航**: 使用 `shadcn/ui` 的 `Tabs` 组件创建了一个清晰的标签页菜单，用户可以在“航班查询与预订”、“我的订单”、“航班管理”和“客户管理”四个功能区之间轻松切换。
- **数据交互**: 每个功能区都提供了表单、按钮和表格，方便用户输入数据、执行操作和查看结果，实现了对数据的加载、修改和保存功能。


![交互界面](<CleanShot 2025-09-06 at 08.50.37@2x.png>)

#### 3.3 编码规范

项目遵循了现代 TypeScript 和 NextJS 的编码标准。代码结构清晰，逻辑分离：
- **类型定义 (`types/`)**: 统一管理数据结构，提高代码可读性和健壮性。
- **逻辑分层 (`lib/`)**: 将业务逻辑 (`flightService`) 与数据访问 (`dataManager`) 分离，符合关注点分离原则。
- **组件化 (`components/`)**: UI 元素被封装成可重用的 React 组件。

### 四、系统测试与分析

#### 4.1 功能测试与演示

所有核心功能均已通过测试，运行结果符合预期。下面将结合功能要求，对各项功能进行测试说明。

**1. 航班查询与预订**
- **要求**: 可按航班号或起飞/抵达城市查询航班的详细信息，实现订票功能。
- **前端实现 (`app/page.tsx`)**: 用户点击“Search”按钮后，`handleSearch`函数通过 `fetch` 调用后端搜索接口。
    ```tsx
    const handleSearch = async () => {
      const response = await fetch(`${API_URL}/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery),
      });
    };
    ```
- **后端实现 (`app/api/flights/search/route.ts`)**: API 接收查询条件，并调用 `flightService.searchFlights` 方法执行搜索。
    ```typescript
    export const POST = async (request: Request) => {
      const query = await request.json() as FlightQuery;
      const flights = flightService.searchFlights(query);
      return NextResponse.json({ success: true, data: flights });
    }
    ```

![航班号查询](<CleanShot 2025-09-06 at 09.17.41@2x.png>)

![起飞城市查询](<CleanShot 2025-09-06 at 09.18.33@2x.png>)

![抵达城市查询](<CleanShot 2025-09-06 at 09.19.07@2x.png>)**2. 订单查看与退票**

- **要求**: 支持退票操作，并同步更新相关数据文件。
- **前端实现 (`app/page.tsx`)**: 用户点击“Refund”按钮，`handleRefund`函数向后端发送退票请求。
    ```tsx
    const handleRefund = async (orderId: string) => {
        const response = await fetch(`${API_URL}/bookings/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
        });
    };
    ```
- **后端实现 (`app/api/bookings/refund/route.ts`)**: API 调用 `flightService.refundTicket` 处理退票逻辑，包括更新订单状态和恢复航班座位数。
    ```typescript
    export const POST = async (request: Request) => {
      const { orderId } = await request.json() as { orderId: string };
      const result = flightService.refundTicket(orderId);
      return NextResponse.json({ success: true, data: result });
    }
    ```

![初始状态](<CleanShot 2025-09-06 at 09.19.44@2x.png>)

![退票提示](<CleanShot 2025-09-06 at 09.20.07@2x.png>)

![退票后](<CleanShot 2025-09-06 at 09.20.26@2x.png>)

**3. 航班录入**
- **要求**: 可以录入航班信息，数据需存储在文件中。
- **前端实现 (`app/page.tsx`)**: 在“Manage Flights”标签页，`handleAddFlight`函数收集表单数据并发送到后端。
    ```tsx
    const handleAddFlight = async () => {
        const response = await fetch(`${API_URL}/flights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFlight),
        });
        // ...刷新航班列表
    };
    ```
- **后端实现 (`app/api/flights/route.ts`)**: API 调用 `flightService.addFlight` 方法，将新航班数据存入 `flights.json`。
    ```typescript
    export const POST = async (request: Request) => {
        const flightData = await request.json();
        const newFlight = flightService.addFlight(flightData);
        return NextResponse.json({ success: true, data: newFlight });
    }
    ```

![添加航班](<CleanShot 2025-09-06 at 09.24.26@2x.png>)

![添加成功](<CleanShot 2025-09-06 at 09.24.47@2x.png>)

**4. 客户管理**
- **要求**: 管理客户信息（姓名、证件号等）。
- **前端实现 (`app/page.tsx`)**: 在“Manage Customers”标签页，`handleAddCustomer`函数收集表单数据并发送到后端。
    ```tsx
    const handleAddCustomer = async () => {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer),
        });
        const result = await response.json();
        if (result.success) {
            alert('Customer added!');
            fetchCustomers();
        } else {
            alert(`Failed to add customer: ${result.message}`);
        }
    };
    ```
- **后端实现 (`app/api/customers/route.ts`)**: API 调用 `flightService.addCustomer` 方法，将新客户数据存入 `customers.json`。
    ```typescript
    export const POST = async (request: Request) => {
      try {
        const customerData = await request.json() as Omit<Customer, 'id'>;
        const customer = flightService.addCustomer(customerData);
        return NextResponse.json({ success: true, data: customer });
      } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
      }
    }
    ```

![添加用户](<CleanShot 2025-09-06 at 10.08.16@2x.png>)

![添加之后](<CleanShot 2025-09-06 at 10.08.38@2x.png>)

**5. 航班修改**
- **要求**: 支持对已录入的航班信息进行修改。
- **后端实现 (`app/api/flights/[flightNumber]/route.ts`)**: 系统提供了 PUT 接口用于修改航班信息。
    ```typescript
    export const PUT = async (request: Request, { params }: { params: { flightNumber: string } }) => {
        try {
            const { flightNumber } = params;
            const updates = await request.json() as Partial<Omit<Flight, 'flightNumber'>>;
            const updatedFlight = flightService.updateFlight(flightNumber, updates);
            return NextResponse.json({ success: true, data: updatedFlight });
        } catch (error) {
            return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
        }
    }
    ```
    ![编辑航班](<CleanShot 2025-09-06 at 10.09.13@2x.png>)

![编辑成功](<CleanShot 2025-09-06 at 10.09.39@2x.png>)

![编辑之后](<CleanShot 2025-09-06 at 10.10.04@2x.png>)
#### 4.2 容错测试
为了确保程序的稳定性，我们设计了以下测试用例来验证系统的容错能力。

| 测试场景 | 输入数据 | 预期结果 | 实际结果 |
| :--- | :--- | :--- | :--- |
| **订票时余票不足** | 为只有0张余票的航班预订座位 | 订票失败，系统提示余票不足。 | **通过**。系统弹出警告框，内容为：“Not enough available seats...” |
| **添加已存在的航班** | 录入一个已存在的航班号 `CA1234` | 添加失败，系统提示航班号已存在。 | **通过**。系统弹出警告框，内容为：“Failed to add flight: Flight number already exists.” |

![订票时余额不足](<CleanShot 2025-09-06 at 08.54.53@2x.png>)

![添加已存在的航班](<CleanShot 2025-09-06 at 08.58.20@2x.png>)

### 五、问题与讨论

本项目虽然实现了核心功能，但仍存在一些局限性和可改进之处：
1.  **数据并发问题**: 使用 JSON 文件作为数据库，在并发写入时可能导致数据不一致或文件损坏。对于生产环境，应替换为专业的数据库系统（如 PostgreSQL, MySQL, MongoDB）。
2.  **用户认证与授权**: 当前系统缺少用户登录和身份验证机制。所有用户共享同一个模拟客户 ID，且没有区分普通用户和管理员。
3.  **错误处理**: 当前的错误处理主要通过 `alert` 实现，用户体验有待提升。可以设计更友好的全局通知或消息提示组件。

### 六、实践总结体会

通过本次课程设计，我成功地将数据结构理论知识应用到了一个完整的全栈 Web 项目中，收获颇丰。

首先，在技术选型上，采用 Next.js、React 和 TypeScript 的现代化技术栈，让我深刻体会到其在提升开发效率和保证代码质量方面的巨大优势。`shadcn/ui` 和 `Tailwind CSS` 的组合不仅加快了 UI 的开发速度，也使得界面美观、统一。

其次，在架构设计上，项目清晰地划分了前端交互（`page.tsx`）、业务逻辑（`flightService.ts`）和数据持久化（`dataManager.ts`）三个层次。这种关注点分离的设计模式，让代码结构更加清晰，易于理解和后期维护。

更重要的是，本次实践让我从应用角度重新审视了数据结构与算法。虽然项目中主要使用了数组和线性搜索等基础知识，但在分析其 `O(n)` 时间复杂度并思考如何使用哈希表（`Map`）进行优化时，我才真正理解了算法效率在实际工程中的重要性。

最后，通过实现一个功能完善的系统，我也认识到了从实验到产品的差距。诸如数据并发控制、用户认证、精细化错误处理等问题，是未来在构建生产级应用时必须深入考虑的。总而言之，这次实践不仅巩固了我的理论知识，更极大地锻炼了我的工程思维和解决实际问题的能力。
