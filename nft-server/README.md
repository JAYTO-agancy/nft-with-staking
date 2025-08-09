# NFT Listener Server

Автоматический сервер для генерации NFT при событиях mint в блокчейне.

## 🚀 Особенности

- **Современный стек**: Использует viem для работы с блокчейном
- **Автоматический RPC**: Использует встроенные RPC URLs Sepolia или пользовательские
- **Общие ABIs**: Переиспользуемые ABIs для фронтенда и бэкенда
- **Статистика контракта**: Подсчет totalSupply и minted NFT
- **Генерация NFT**: Создает уникальные NFT с разными уровнями редкости
- **Загрузка в S3**: Автоматически загружает изображения и метаданные в S3-совместимое хранилище
- **RESTful API**: Предоставляет API для проверки статуса генерации
- **In-memory job management**: Хранит статус задач в памяти для быстрого доступа
- **Упрощенный режим**: Работает с ограничениями бесплатных RPC провайдеров
- **Устойчивость к сбоям**: Продолжает работу даже если пользователь покинул сайт

## 📋 Архитектура

```
Пользователь -> Mint контракт -> Event Listener -> Генерация NFT -> S3 -> Готовый NFT
                                       ↓
                               Job Manager (статус)
                                       ↓
                                 API Endpoints
                                       ↓
                                Фронтенд (polling)
```

## 🛠️ Установка

1. **Установите зависимости:**
```bash
cd nft-listener-server
pnpm i
```

2. **Настройте переменные окружения:**
```bash
cp env.example .env
```

Отредактируйте `.env`:
```env
# Blockchain Configuration (optional - will use default Sepolia RPC if not provided)
RPC_URL=https://your-rpc-endpoint
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Optional (для MinIO/совместимых сервисов)
# S3_ENDPOINT=https://s3.your-provider.com
# S3_FORCE_PATH_STYLE=true
# S3_PUBLIC_BASE_URL=https://cdn.your-domain.com
# S3_PREFIX=nft

# Server Configuration
PORT=3001

# NFT Generator
NFT_GENERATOR_PATH=../nft-generator-hashlips
```

3. **Убедитесь что NFT generator настроен:**
```bash
cd ../nft-generator-hashlips
pnpm i
# Проверьте что layers/ содержит ваши изображения
```

## 🚀 Запуск

### Development
```bash
pnpm dev
```

### Production
```bash
pnpm build
pnpm start
```

Сервер будет доступен по адресу: `http://localhost:3001`

## 📡 API Endpoints

### Проверка статуса
- `GET /health` - Проверка работоспособности сервера
- `GET /stats` - Статистика заданий генерации

### Статистика контракта
- `GET /contract/stats` - Полная статистика контракта (totalSupply, totalMinted)
- `GET /contract/supply` - Только totalSupply

### Управление заданиями
- `GET /job/:jobId` - Получить статус задания по ID
- `GET /token/:tokenId` - Получить статус по токену
- `GET /user/:address/jobs` - Получить все задания пользователя

### События блокчейна
- `GET /events/past` - Получить прошлые события mint

### Тестирование (только для разработки)
- `POST /test/create-job` - Создать тестовое задание

## 🎨 Как это работает

### 1. Процесс mint

```typescript
// Пользователь делает mint
const tx = await nftContract.mint();

// Сервер автоматически получает событие
contractListener.on("Transfer", (from, to, tokenId) => {
  if (from === "0x0") { // mint event
    const job = jobManager.createJob({
      tokenId,
      userAddress: to,
      // ...
    });
    
    processJob(job.id);
  }
});
```

### 2. Генерация NFT

```typescript
// Генерируем NFT
const { imagePath, metadata } = await nftGenerator.generateNFT(
  rarityName, 
  tokenId
);

// Загружаем в S3
const imageUrl = await s3Service.uploadImage(imagePath, tokenId);
const metadataUrl = await s3Service.uploadMetadata(metadata, tokenId);
```

### 3. Отслеживание на фронтенде

```typescript
// React Hook
const { status, isCompleted } = useNFTGeneration(tokenId, {
  onComplete: (status) => {
    console.log('NFT готов!', status.imageUrl);
  }
});

// Компонент автоматически показывает прогресс
<NFTGenerationStatus tokenId={tokenId} userAddress={address} />
```

## 🔧 Публичные URL для S3

Публичные ссылки формируются так:
- AWS S3: `https://{bucket}.s3.{region}.amazonaws.com/{prefix}/images/{tokenId}.png`
- Кастомный CDN/Endpoint: `{S3_PUBLIC_BASE_URL}/{prefix}/images/{tokenId}.png`

## 📊 Мониторинг

### Проверка статуса сервера
```bash
curl http://localhost:3001/health
```

### Статистика заданий
```bash
curl http://localhost:3001/stats
```

Ответ:
```json
{
  "stats": {
    "total": 15,
    "pending": 2,
    "generating": 1,
    "uploading": 0,
    "completed": 10,
    "failed": 2
  }
}
```

## 🛠️ Интеграция с фронтендом

### 1. Обновите environment variables

В файле `.env.local` вашего Next.js приложения:
```env
NFT_LISTENER_SERVER_URL=http://localhost:3001
```

### 2. Используйте компоненты

```tsx
import { NFTGenerationStatusComponent } from '@/shared/components/NFTGenerationStatus';

function MintPage() {
  const [tokenId, setTokenId] = useState<number | null>(null);
  const { address } = useAccount();

  const handleMint = async () => {
    // Выполните mint транзакцию
    const tx = await nftContract.mint();
    const receipt = await tx.wait();
    
    // Получите token ID из events
    const tokenId = getTokenIdFromReceipt(receipt);
    setTokenId(tokenId);
  };

  return (
    <div>
      <button onClick={handleMint}>Mint NFT</button>
      
      {tokenId && (
        <NFTGenerationStatusComponent
          tokenId={tokenId}
          userAddress={address}
          onComplete={(status) => {
            // NFT готов! Перенаправить в инвентарь
            router.push(`/inventory/${tokenId}`);
          }}
        />
      )}
    </div>
  );
}
```

## 🔄 Обработка ошибок

Сервер автоматически:
- Повторяет неудачные задания
- Логирует все ошибки
- Очищает старые задания
- Поддерживает соединение с блокчейном

## 📝 Логирование

Все важные события логируются:
- ✅ Успешные операции  
- ❌ Ошибки
- 🎧 События блокчейна
- 📤 Загрузки в S3
- 🎨 Генерация NFT

## 🚦 Deployment

### Docker (рекомендуется)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name nft-listener
pm2 startup
pm2 save
```

## 🔒 Безопасность

- Используйте отдельный приватный ключ для сервера
- Ограничьте доступ к Pinata API ключам
- Настройте CORS для production
- Используйте HTTPS в production