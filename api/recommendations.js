function generateRecommendedRoutes(origin, destination, preferences = {}) {
  const routes = [];
  const baseTime = 45; // 기본 소요시간 (분)
  
  // 3개의 다른 경로 생성
  for (let i = 0; i < 3; i++) {
    const routeVariation = i * 5; // 경로별 시간 차이
    const congestionLevel = 50 + (Math.random() - 0.5) * 40;
    
    const now = new Date();
    const departureTime = new Date(now.getTime() + (5 + i * 10) * 60 * 1000);
    const arrivalTime = new Date(now.getTime() + (baseTime + routeVariation + 5 + i * 10) * 60 * 1000);
    
    const route = {
      route_id: `route_${i + 1}`,
      total_time: baseTime + routeVariation + Math.floor(Math.random() * 10),
      walking_time: 5 + Math.floor(Math.random() * 10),
      transfers: i,
      avg_congestion: Math.round(Math.max(20, Math.min(90, congestionLevel))),
      departure_time: departureTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      arrival_time: arrivalTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      steps: generateRouteSteps(i)
    };
    
    routes.push(route);
  }
  
  // 선호도에 따른 정렬
  routes.sort((a, b) => {
    if (preferences.max_congestion && a.avg_congestion <= preferences.max_congestion && b.avg_congestion > preferences.max_congestion) {
      return -1;
    }
    if (preferences.max_walking_time && a.walking_time <= preferences.max_walking_time && b.walking_time > preferences.max_walking_time) {
      return -1;
    }
    return a.total_time - b.total_time; // 기본적으로 시간순 정렬
  });
  
  return routes;
}

function generateRouteSteps(routeIndex) {
  const steps = [
    {
      type: 'walk',
      duration: 3 + Math.floor(Math.random() * 5),
      description: '출발지에서 지하철역까지 도보'
    }
  ];
  
  // 환승 횟수에 따른 단계 추가
  if (routeIndex === 0) {
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 35 + Math.floor(Math.random() * 10),
      congestion: 50 + Math.floor(Math.random() * 30)
    });
  } else if (routeIndex === 1) {
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 20 + Math.floor(Math.random() * 5),
      congestion: 45 + Math.floor(Math.random() * 20)
    });
    steps.push({
      type: 'transfer',
      duration: 3,
      description: '9호선으로 환승'
    });
    steps.push({
      type: 'subway',
      line: '9호선',
      duration: 15 + Math.floor(Math.random() * 5),
      congestion: 60 + Math.floor(Math.random() * 25)
    });
  } else {
    steps.push({
      type: 'bus',
      line: '간선버스',
      duration: 25 + Math.floor(Math.random() * 10),
      congestion: 40 + Math.floor(Math.random() * 30)
    });
    steps.push({
      type: 'transfer',
      duration: 2,
      description: '지하철로 환승'
    });
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 20 + Math.floor(Math.random() * 8),
      congestion: 55 + Math.floor(Math.random() * 25)
    });
  }
  
  steps.push({
    type: 'walk',
    duration: 2 + Math.floor(Math.random() * 3),
    description: '지하철역에서 목적지까지 도보'
  });
  
  return steps;
}

export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { origin, destination, departure_time, preferences } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({
        status: 'error',
        message: 'Origin and destination are required'
      });
    }
    
    const routes = generateRecommendedRoutes(origin, destination, preferences);
    
    return res.status(200).json({
      status: 'success',
      data: {
        origin,
        destination,
        routes,
        generated_at: new Date().toISOString()
      }
    });
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
}