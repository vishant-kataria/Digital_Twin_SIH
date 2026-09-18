import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np

class TimeSeriesDataset(Dataset):
    def __init__(self, data, target, seq_len=30):
        self.seq_len = seq_len
        self.X = torch.tensor(data, dtype=torch.float32)
        self.y = torch.tensor(target, dtype=torch.float32)

    def __len__(self):
        return len(self.X) - self.seq_len

    def __getitem__(self, idx):
        return self.X[idx:idx+self.seq_len], self.y[idx+self.seq_len]

class EngineLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2):
        super(EngineLSTM, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

print("Loading data...")
df = pd.read_csv('full_fault_telemetry.csv')
features = df.drop(columns=['fault_label', 'rul_hours']).values
target = df['rul_hours'].values

mean, std = features.mean(axis=0), features.std(axis=0)
norm_features = (features - mean) / (std + 1e-6)

dataset = TimeSeriesDataset(norm_features, target, seq_len=30)
loader = DataLoader(dataset, batch_size=128, shuffle=True)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Training on: {device}")

model = EngineLSTM(input_dim=norm_features.shape[1]).to(device)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

model.train()
for epoch in range(5):
    total_loss = 0.0
    for batch_x, batch_y in loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        optimizer.zero_grad()
        preds = model(batch_x).squeeze()
        loss = criterion(preds, batch_y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/5 - MSE Loss: {total_loss/len(loader):.4f}")

torch.save(model.state_dict(), 'lstm_rul_model.pt')
print("Model weights saved to lstm_rul_model.pt")