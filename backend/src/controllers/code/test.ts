import { logger } from "@util";

export default async () => 
{

  const a = {
    a: {
      b: [
        {
          c: 1
        },
        {
          d: 1
        }
      ]
    },
    b: {
      a: 1,
      b: '2',
      c: '3',
      d: false
    }
  }

	logger.verbose(JSON.stringify(a, null, 2))
};