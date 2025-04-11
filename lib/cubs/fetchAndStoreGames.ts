import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getWeekRange(): [string, string] {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 6);
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  return [toISO(start), toISO(end)];
}

export async function fetchCubsHomeGamesThisWeek() {
  const [startDate, endDate] = getWeekRange();
  const url = `https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&startDate=${startDate}&endDate=${endDate}`;
  const res = await fetch(url);
  const json = await res.json();

  const games = json.dates
    .flatMap((d: any) => d.games)
    .filter(
      (game: any) =>
        game.teams?.home?.team?.name === 'Chicago Cubs' &&
        game.venue?.name === 'Wrigley Field'
    )
    .map((game: any) => ({
      title: `${game.teams.away.team.name} @ Cubs`,
      start: game.gameDate,
      end: new Date(new Date(game.gameDate).getTime() + 3 * 60 * 60 * 1000).toISOString(),
      all_day: false,
    }));

  return games;
}

export async function storeCubsGames(events: any[]) {
  const { data, error } = await supabase.from('calendar').insert(events);
  if (error) throw new Error('Failed to insert events: ' + error.message);
  return data;
}
