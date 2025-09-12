export class BaseController {
    getAll(req: any, res: any) {
        // Logic to get all items
    }

    getById(req: any, res: any) {
        // Logic to get an item by ID
    }

    create(req: any, res: any) {
        // Logic to create a new item
    }

    update(req: any, res: any) {
        // Logic to update an existing item
    }

    delete(req: any, res: any) {
        // Logic to delete an item
    }
}

export const YourController = new BaseController();