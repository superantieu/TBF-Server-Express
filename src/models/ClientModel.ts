import mongoose from "mongoose";

interface IClient {
    name: string;
    code: string;
    workFolder: string;
}
const clientSchema = new mongoose.Schema<IClient>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        workFolder: { type: String, required: false },
    },
    { timestamps: true }
);

export const ClientModel = mongoose.model<IClient>("Client", clientSchema);
